import * as WebSocket from 'ws';

export interface ClientState {
  [key: string]: any;
}

export interface ClientConfig {
  id: string;
  initialState: ClientState;
  port: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: any) => void;
}

export class VSCodeClient {
  private ws: WebSocket.WebSocket | null = null;
  private clientId: string;
  private clientState: ClientState;
  private config: ClientConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onMessage: (message: any) => void;

  constructor(config: ClientConfig) {
    this.clientId = config.id;
    this.clientState = config.initialState;
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: Infinity,
      ...config,
    };
    this.onMessage = config.onMessage || (() => {});
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://localhost:${this.config.port}`;
      this.ws = new WebSocket.WebSocket(url);

      this.ws.on('open', () => {
        console.log(`Client ${this.clientId} connected to server`);
        this.reconnectAttempts = 0;
        this.sendIntroduction();
        resolve();
      });

      this.ws.on('close', () => {
        console.log(`Client ${this.clientId} disconnected from server`);
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error(`Client ${this.clientId} error:`, error);
        reject(error);
      });

      this.ws.on('message', (data) => {
        if (data.toString() === 'pong') {
          return;
        }

        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing server message:', error);
        }
      });
    });
  }

  sendMessage(message: any): void {
    this.send(JSON.stringify(message));
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.log(`Max reconnect attempts (${this.config.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`,
    );

    this.reconnectTimer = setTimeout(async () => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  private sendIntroduction(): void {
    const introMessage = {
      type: 'introduction',
      clientId: this.clientId,
      data: this.clientState,
      timestamp: Date.now(),
    };

    this.send(JSON.stringify(introMessage));
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'peers':
        // console.log(`Client ${this.clientId} received peers:`, message.data);
        break;
      case 'peer_joined':
        //  console.log(`Client ${this.clientId} - New peer joined:`, message.data);
        break;
      case 'peer_left':
        // console.log(`Client ${this.clientId} - Peer left:`, message.data.clientId);
        break;
      case 'error':
        console.error('Server error:', message.data);
        break;
    }

    this.onMessage(message);
  }

  private send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  updateState(newState: Partial<ClientState>): void {
    this.clientState = { ...this.clientState, ...newState };
    this.sendStateUpdate();
  }

  private sendStateUpdate(): void {
    const updateMessage = {
      type: 'state_update',
      clientId: this.clientId,
      data: this.clientState,
      timestamp: Date.now(),
    };

    this.send(JSON.stringify(updateMessage));
  }

  getState(): ClientState {
    return { ...this.clientState };
  }
}
