import { Game, JoinGameData, WSMessage, User, Player } from '../types';
import type { WebSocket } from 'ws';
import { broadcast } from '../utility/broadcast';

interface handleJoinGameProps {
  data: JoinGameData;
  games: Map<string, Game>;
  wsMessage: WSMessage;
  ws: WebSocket;
  clients: Map<WebSocket, User>;
}

export const handleJoinGame = ({ data, games, wsMessage, ws, clients }: handleJoinGameProps) => {
  const { code } = data;
  const game = Array.from(games.values()).find(
    (game) => game.code.toLowerCase() === code.toLowerCase(),
  );

  if (!game) {
    throw Error('Incorrect game code');
  }

  const user = clients.get(ws);
  if (!user) throw Error('User not found');

  const player: Player = { name: user.name, index: user.index, score: 0 };
  game.players.push(player);

  const game_joined = { type: 'game_joined', data: { gameId: game.id }, id: 0 };
  ws.send(JSON.stringify(game_joined));

  const player_joined = {
    type: 'player_joined',
    data: { playerName: user.name, playerCount: game.players.length },
    id: 0,
  };

  const update_players = {
    type: 'update_players',
    data: game.players.map((p) => ({ name: p.name, index: p.index, score: p.score })),
    id: 0,
  };

  broadcast(game, clients, player_joined);
  broadcast(game, clients, update_players);
};
