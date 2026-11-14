import { Peer, DataConnection } from 'peerjs';
import { Player, Question, AnsweredLog } from '../types/game';

export type NetworkEvent =
  | { type: 'GUEST_JOINED'; player: Player }
  | { type: 'START_GAME'; player1: Player; player2: Player }
  | { type: 'DICE_ROLL'; value: number; power: number }
  | { type: 'QUESTION_OPENED'; question: Question }
  | { type: 'DARE_OPENED'; dare: Question }
  | { type: 'QUESTION_REROLLED'; question: Question }
  | { type: 'DARE_REROLLED'; dare: Question }
  | { type: 'TURN_COMPLETED'; nextTurn: 'p1' | 'p2'; log?: AnsweredLog }
  | { type: 'RESTART_GAME' };

export class MultiplayerService {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  public isHost: boolean = false;
  public roomCode: string = '';
  private eventHandlers: ((event: NetworkEvent) => void)[] = [];
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

  // Create room as Host (Pemain 1)
  public createRoom(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      this.roomCode = code.toUpperCase();
      const peerId = `sq-love-${this.roomCode.toLowerCase()}`;

      this.cleanup();

      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          resolve(this.roomCode);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.setupConnection();
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS Host Error:', err);
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Join room as Guest (Pemain 2)
  public joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      this.roomCode = code.toUpperCase();
      const hostPeerId = `sq-love-${this.roomCode.toLowerCase()}`;

      this.cleanup();

      try {
        // Random guest peer ID
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', () => {
          if (!this.peer) return;
          const connection = this.peer.connect(hostPeerId, {
            reliable: true,
          });
          this.conn = connection;
          this.setupConnection();

          connection.on('open', () => {
            resolve();
          });

          connection.on('error', (err) => {
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS Guest Error:', err);
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private setupConnection() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.onConnectedHandlers.forEach((cb) => cb());
    });

    this.conn.on('data', (data: any) => {
      if (data && data.type) {
        this.eventHandlers.forEach((cb) => cb(data as NetworkEvent));
      }
    });

    this.conn.on('close', () => {
      this.onDisconnectedHandlers.forEach((cb) => cb());
    });

    this.conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  // Send event to partner
  public send(event: NetworkEvent) {
    if (this.conn && this.conn.open) {
      this.conn.send(event);
    }
  }

  public onEvent(handler: (event: NetworkEvent) => void) {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
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
    if (this.conn) {
      try {
        this.conn.close();
      } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }
  }
}

export const multiplayer = new MultiplayerService();
