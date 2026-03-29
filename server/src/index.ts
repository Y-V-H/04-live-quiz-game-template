import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { WSMessage, User, Game } from './types';

import { handleReg } from './handlers/registerLogin';
import { handleCreateGame } from './handlers/createGame';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
// hash
const users = new Map<string, User>();
const games = new Map<string, Game>();
const clients = new Map<WebSocket, User>();
// WebSocket server
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const wsMessage: WSMessage = JSON.parse(message.toString());
    const { type, data } = wsMessage;

    switch (type) {
      case 'reg':
        handleReg({ data, users, wsMessage, ws, clients });
        break;
      case 'create_game':
        handleCreateGame({ data, games, ws, clients });
        break;
      case 'join_game':
        console.log(1);
        break;
      case 'start_game':
        console.log(1);
        break;
      case 'answer':
        console.log(1);
        break;
      default:
        console.log('default');
    }
  });
});
