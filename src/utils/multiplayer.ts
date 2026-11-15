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
  private hostHeartbeatTimer: any = null;
  private cachedHostPlayer: Player | null = null;
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

  // Connect to EMQX / HiveMQ public secure WebSockets with auto-fallback
  private connectBroker(): Promise<MqttClient> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve(this.client);
        return;
      }

      this.cleanup();

      const clientId = `sq-${Math.random().toString(36).substring(2, 9)}`;
      const brokers = [
        'wss://broker.emqx.io:8084/mqtt',
        'wss://broker.hivemq.com:8884/mqtt',
      ];
      let currentBrokerIndex = 0;
      let settled = false;

      const tryConnect = (url: string) => {
        const client = mqtt.connect(url, {
          clientId,
          clean: false, // keep session
          connectTimeout: 5000,
          reconnectPeriod: 2000,
        });

        const timer = setTimeout(() => {
          if (!settled) {
            client.end(true);
            currentBrokerIndex++;
            if (currentBrokerIndex < brokers.length) {
              tryConnect(brokers[currentBrokerIndex]);
            } else {
              settled = true;
              reject(new Error('Koneksi ke server room timeout. Pastikan koneksi internet stabil.'));
            }
          }
        }, 5500);

        client.on('connect', () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            this.client = client;
            this.setupMessageHandler();
            this.onConnectedHandlers.forEach((cb) => cb());
            resolve(client);
          }
        });

        client.on('error', (err) => {
          if (!settled && currentBrokerIndex < brokers.length - 1) {
            clearTimeout(timer);
            client.end(true);
            currentBrokerIndex++;
            tryConnect(brokers[currentBrokerIndex]);
          } else if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(err);
          }
        });

        client.on('close', () => {
          this.onDisconnectedHandlers.forEach((cb) => cb());
        });
      };

      tryConnect(brokers[currentBrokerIndex]);
    });
  }

  // Host creates room and publishes retained room info with active heartbeat
  public async createRoom(code: string, hostPlayer: Player): Promise<string> {
    this.isHost = true;
    this.roomCode = code.toUpperCase();
    this.cachedHostPlayer = hostPlayer;
    const client = await this.connectBroker();

    const topicEvents = `snake-questions/v2/${this.roomCode}/events`;
    const topicGuest = `snake-questions/v2/${this.roomCode}/guest`;
    const topicInfo = `snake-questions/v2/${this.roomCode}/info`;
    const topicState = `snake-questions/v2/${this.roomCode}/state`;

    return new Promise((resolve, reject) => {
      client.subscribe([topicEvents, topicGuest, topicInfo, topicState], (err) => {
        if (err) {
          reject(err);
          return;
        }

        const publishInfo = () => {
          if (this.client && this.client.connected && this.cachedHostPlayer) {
            this.client.publish(
              topicInfo,
              JSON.stringify({
                roomCode: this.roomCode,
                host: this.cachedHostPlayer,
                createdAt: Date.now(),
              }),
              { retain: true, qos: 1 }
            );
          }
        };

        // Publish retained room info immediately
        publishInfo();

        // Active Heartbeat: periodically re-broadcast while waiting in lobby
        if (this.hostHeartbeatTimer) clearInterval(this.hostHeartbeatTimer);
        this.hostHeartbeatTimer = setInterval(publishInfo, 1800);

        // Also listen for active guest discovery requests
        const discoveryListener = (topic: string, payload: Buffer) => {
          if (topic === topicGuest || topic === topicEvents) {
            try {
              const msg = JSON.parse(payload.toString());
              if (msg && msg.type === 'REQUEST_ROOM_INFO') {
                publishInfo();
              }
            } catch (e) {}
          }
        };
        client.on('message', discoveryListener);

        resolve(this.roomCode);
      });
    });
  }

  // Guest joins an existing room and retrieves host info with 2-way active discovery
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
      let pingTimer: any = null;

      const timeout = setTimeout(() => {
        if (!resolved) {
          if (pingTimer) clearInterval(pingTimer);
          reject(new Error('Room tidak ditemukan atau kode salah. Pastikan pasangan sudah membuat room.'));
        }
      }, 14000);

      const checkHandler = (topic: string, payload: Buffer) => {
        if (topic === topicInfo) {
          try {
            const data = JSON.parse(payload.toString());
            if (data && data.host) {
              resolved = true;
              clearTimeout(timeout);
              if (pingTimer) clearInterval(pingTimer);
              client.removeListener('message', checkHandler);

              // Notify host that guest joined with retain: true & live broadcast
              const joinPayload = JSON.stringify({
                type: 'GUEST_JOINED',
                player: guestPlayer,
              });
              client.publish(topicGuest, joinPayload, { retain: true, qos: 1 });
              client.publish(topicEvents, joinPayload, { qos: 1 });

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
          if (pingTimer) clearInterval(pingTimer);
          reject(err);
          return;
        }

        // Actively ping the host in case retained message was delayed
        const sendPing = () => {
          if (client.connected && !resolved) {
            const pingMsg = JSON.stringify({
              type: 'REQUEST_ROOM_INFO',
              guest: guestPlayer,
            });
            client.publish(topicGuest, pingMsg, { qos: 1 });
            client.publish(topicEvents, pingMsg, { qos: 1 });
          }
        };

        sendPing();
        pingTimer = setInterval(sendPing, 1000);
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

  public stopHeartbeat() {
    if (this.hostHeartbeatTimer) {
      clearInterval(this.hostHeartbeatTimer);
      this.hostHeartbeatTimer = null;
    }
  }

  public cleanup() {
    if (this.hostHeartbeatTimer) {
      clearInterval(this.hostHeartbeatTimer);
      this.hostHeartbeatTimer = null;
    }
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {}
      this.client = null;
    }
  }
}

export const multiplayer = new MultiplayerService();
