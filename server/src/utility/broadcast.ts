import { Game, User } from '../types';
import type { WebSocket } from 'ws';

export const broadcast = (game: Game, clients: Map<WebSocket, User>, message: object) => {
  clients.forEach((user, clientWs) => {
    if (game.players.some((p) => p.index === user.index)) {
      clientWs.send(JSON.stringify(message));
    }
  });
};
