import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { WSMessage, User, Game } from './types';

import { handleReg } from './handlers/registerLogin';
import { handleCreateGame } from './handlers/createGame';
import { handleJoinGame } from './handlers/joinGame';
import { handelStartGame } from './handlers/startGame';
import { handleAnswer } from './handlers/answer';

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
        handleJoinGame({ data, games, wsMessage, ws, clients });
        break;
      case 'start_game':
        handelStartGame({ data, games, clients });
        break;
      case 'answer':
        handleAnswer({ data, games, clients, ws });
        break;
      default:
        console.log('default');
    }
  });

  ws.on('close', () => {
    const user = clients.get(ws);
    if (user) {
      games.forEach((game) => {
        const wasInGame = game.players.some((player) => player.index === user.index);
        if (wasInGame) {
          game.players = game.players.filter((player) => player.index !== user.index);

          clients.forEach((client, clientWs) => {
            if (game.players.some((player) => player.index === client.index)) {
              clientWs.send(
                JSON.stringify({
                  type: 'update_players',
                  data: game.players.map((player) => ({
                    name: player.name,
                    index: player.index,
                    score: player.score,
                  })),
                  id: 0,
                }),
              );
            }
          });
        }
      });
      clients.delete(ws);
    }
  });
});

console.log(`WebSocket server started on ws://localhost:${PORT}`);
