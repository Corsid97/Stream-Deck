import { WebSocketServer, WebSocket } from 'ws';
import type { BridgeMessage, BridgeResponse, BridgeStatus } from '../shared/types';
import type { ActionExecutor } from './actions';

export class BridgeServer {
  private wss: WebSocketServer | null = null;
  private port: number;
  private status: BridgeStatus = 'disconnected';
  private actionExecutor: ActionExecutor;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number, actionExecutor: ActionExecutor) {
    this.port = port;
    this.actionExecutor = actionExecutor;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.wss) {
        resolve();
        return;
      }

      this.status = 'connecting';

      this.wss = new WebSocketServer({
        port: this.port,
        host: '127.0.0.1',
      });

      this.wss.on('listening', () => {
        this.status = 'connected';
        console.log(`DeckForge Bridge listening on ws://127.0.0.1:${this.port}`);
        resolve();
      });

      this.wss.on('error', (err) => {
        this.status = 'error';
        console.error('Bridge server error:', err);
        reject(err);
      });

      this.wss.on('connection', (ws) => {
        console.log('Bridge client connected');
        this.clients.add(ws);

        ws.on('message', async (data) => {
          try {
            const message: BridgeMessage = JSON.parse(data.toString());
            const response = await this.handleMessage(message);
            ws.send(JSON.stringify(response));
          } catch (err) {
            const errorResponse: BridgeResponse = {
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            };
            ws.send(JSON.stringify(errorResponse));
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
          console.log('Bridge client disconnected');
        });

        ws.on('error', (err) => {
          console.error('Bridge client error:', err);
          this.clients.delete(ws);
        });
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }

      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();

      this.wss.close(() => {
        this.wss = null;
        this.status = 'disconnected';
        console.log('Bridge server stopped');
        resolve();
      });
    });
  }

  getStatus(): BridgeStatus {
    return this.status;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcast(message: BridgeResponse): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  private async handleMessage(message: BridgeMessage): Promise<BridgeResponse> {
    const { action, params, requestId } = message;

    const result = await this.actionExecutor.execute({
      type: action as any,
      label: '',
      params: params || {},
    });

    return {
      requestId,
      success: result.success,
      data: result,
      error: result.error,
    };
  }
}
