import mqtt, { MqttClient } from 'mqtt';
import { Player, Question, AnsweredLog, SyncedGameState } from '../types/game';

export type NetworkEvent =
  | { type: 'GUEST_JOINED'; player: Player }
  | { type: 'START_GAME'; player1: Player; player2: Player }
  | { type: 'DICE_ROLL'; value: number; power: number }
  | { type: 'QUESTION_OPENED'; question: Question }
  | { type: 'DARE_OPENED'; dare: Question }
  | { type: 'QUESTION_REROLLED'; question: Question }
  | { type: 'DARE_REROLLED'; dare: Question }
  | { type: 'TURN_COMPLETED'; nextTurn: 'p1' | 'p2'; log?: AnsweredLog }
  | { type: 'GAME_STATE_SYNC'; state: SyncedGameState }
  | { type: 'RESTART_GAME' };

class MultiplayerService {
  private client: MqttClient | null = null;
  public isHost: boolean = false;
  public roomCode: string = '';
  private eventHandlers: ((event: NetworkEvent) => void)[] = [];
  private gameStateHandlers: ((state: SyncedGameState) => void)[] = [];
  private onConnectedHandlers: (() => void)[] = [];
  private onDisconnectedHandlers: (() => void)[] = [];

  // Generate safe 5-char room code
  public generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Connect to EMQX / HiveMQ public secure WebSockets
  private connectBroker(): Promise<MqttClient> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve(this.client);
        return;
      }

      this.cleanup();

      const clientId = `sq-${Math.random().toString(36).substring(2, 9)}`;
      const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId,
        clean: false, // keep session
        connectTimeout: 8000,
        reconnectPeriod: 2000,
      });

      const timer = setTimeout(() => {
        reject(new Error('Koneksi ke server room timeout.'));
      }, 9000);

      client.on('connect', () => {
        clearTimeout(timer);
        this.client = client;
        this.setupMessageHandler();
        this.onConnectedHandlers.forEach((cb) => cb());
        resolve(client);
      });

      client.on('error', (err) => {
        clearTimeout(timer);
        console.error('MQTT error:', err);
        reject(err);
      });

      client.on('close', () => {
        this.onDisconnectedHandlers.forEach((cb) => cb());
      });
    });
  }

  // Host creates room and publishes retained room info
  public async createRoom(code: string, hostPlayer: Player): Promise<string> {
    this.isHost = true;
    this.roomCode = code.toUpperCase();
    const client = await this.connectBroker();

    const topicEvents = `snake-questions/v2/${this.roomCode}/events`;
    const topicGuest = `snake-questions/v2/${this.roomCode}/guest`;
    const topicInfo = `snake-questions/v2/${this.roomCode}/info`;
    const topicState = `snake-questions/v2/${this.roomCode}/state`;

    return new Promise((resolve, reject) => {
      client.subscribe([topicEvents, topicGuest, topicState], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Publish retained room info
        client.publish(
          topicInfo,
          JSON.stringify({
            roomCode: this.roomCode,
            host: hostPlayer,
            createdAt: Date.now(),
          }),
          { retain: true, qos: 1 },
          () => {
            resolve(this.roomCode);
          }
        );
      });
    });
  }

  // Guest joins an existing room and retrieves host info
  public async joinRoom(code: string, guestPlayer: Player): Promise<Player> {
    this.isHost = false;
    this.roomCode = code.toUpperCase();
    const client = await this.connectBroker();

    const topicEvents = `snake-questions/v2/${this.roomCode}/events`;
    const topicGuest = `snake-questions/v2/${this.roomCode}/guest`;
    const topicInfo = `snake-questions/v2/${this.roomCode}/info`;
    const topicState = `snake-questions/v2/${this.roomCode}/state`;

    return new Promise((resolve, reject) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          reject(new Error('Room tidak ditemukan atau kode salah. Pastikan pasangan sudah membuat room.'));
        }
      }, 6500);

      const checkHandler = (topic: string, payload: Buffer) => {
        if (topic === topicInfo) {
          try {
            const data = JSON.parse(payload.toString());
            if (data && data.host) {
              resolved = true;
              clearTimeout(timeout);
              client.removeListener('message', checkHandler);

              // Notify host that guest joined with retain: true
              client.publish(
                topicGuest,
                JSON.stringify({
                  type: 'GUEST_JOINED',
                  player: guestPlayer,
                }),
                { retain: true, qos: 1 }
              );

              resolve(data.host as Player);
            }
          } catch (e) {
            // ignore
          }
        }
      };

      client.on('message', checkHandler);

      client.subscribe([topicInfo, topicEvents, topicGuest, topicState], (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });
    });
  }

  // Reconnect directly to an ongoing session room
  public async resumeRoomSession(code: string, isHostRole: boolean): Promise<SyncedGameState | null> {
    this.isHost = isHostRole;
    this.roomCode = code.toUpperCase();
    const client = await this.connectBroker();

    const topicEvents = `snake-questions/v2/${this.roomCode}/events`;
    const topicGuest = `snake-questions/v2/${this.roomCode}/guest`;
    const topicInfo = `snake-questions/v2/${this.roomCode}/info`;
    const topicState = `snake-questions/v2/${this.roomCode}/state`;

    return new Promise((resolve) => {
      let fetchedState: SyncedGameState | null = null;
      const stateTimer = setTimeout(() => {
        resolve(fetchedState);
      }, 2500);

      const stateHandler = (topic: string, payload: Buffer) => {
        if (topic === topicState) {
          try {
            const data = JSON.parse(payload.toString());
            if (data && data.roomCode) {
              fetchedState = data as SyncedGameState;
              clearTimeout(stateTimer);
              client.removeListener('message', stateHandler);
              resolve(fetchedState);
            }
          } catch (e) {}
        }
      };

      client.on('message', stateHandler);
      client.subscribe([topicInfo, topicEvents, topicGuest, topicState], () => {});
    });
  }

  // Publish persistent retained game state
  public publishGameState(state: SyncedGameState) {
    if (this.client && this.client.connected && this.roomCode) {
      const topicState = `snake-questions/v2/${this.roomCode}/state`;
      this.client.publish(topicState, JSON.stringify(state), { retain: true, qos: 1 });
    }
  }

  // Setup message router
  private setupMessageHandler() {
    if (!this.client) return;

    this.client.on('message', (topic: string, payload: Buffer) => {
      try {
        const text = payload.toString();
        const msg = JSON.parse(text);

        if (topic.endsWith('/state')) {
          if (msg && msg.roomCode) {
            this.gameStateHandlers.forEach((handler) => handler(msg as SyncedGameState));
          }
        } else if (msg && msg.type) {
          this.eventHandlers.forEach((handler) => handler(msg as NetworkEvent));
        }
      } catch (e) {
        // ignore non-json
      }
    });
  }

  // Send real-time game event to partner
  public send(event: NetworkEvent) {
    if (this.client && this.client.connected && this.roomCode) {
      const topicEvents = `snake-questions/v2/${this.roomCode}/events`;
      this.client.publish(topicEvents, JSON.stringify(event), { qos: 1 });
    }
  }

  public onEvent(handler: (event: NetworkEvent) => void) {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  public onGameState(handler: (state: SyncedGameState) => void) {
    this.gameStateHandlers.push(handler);
    return () => {
      this.gameStateHandlers = this.gameStateHandlers.filter((h) => h !== handler);
    };
  }

  public onConnected(handler: () => void) {
    this.onConnectedHandlers.push(handler);
    return () => {
      this.onConnectedHandlers = this.onConnectedHandlers.filter((h) => h !== handler);
    };
  }

  public onDisconnected(handler: () => void) {
    this.onDisconnectedHandlers.push(handler);
    return () => {
      this.onDisconnectedHandlers = this.onDisconnectedHandlers.filter((h) => h !== handler);
    };
  }

  public cleanup() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {}
      this.client = null;
    }
  }
}

export const multiplayer = new MultiplayerService();
