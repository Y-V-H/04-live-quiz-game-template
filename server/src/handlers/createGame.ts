import { randomUUID } from 'crypto';
import { User, Game, Player } from '../types';
import type { WebSocket } from 'ws';

interface handleCreateGameProps {
  data: Game;
  clients: Map<WebSocket, User>;
  ws: WebSocket;
  games: Map<string, Game>;
}

export const handleCreateGame = ({ data, clients, ws, games }: handleCreateGameProps) => {
  const isQuestionsExist = !!data.questions.length;

  if (isQuestionsExist) {
    const code = randomUUID().split('-')[0].slice(0, 6);
    const gameId = randomUUID();
    const res = {
      type: 'game_created',
      id: data.id,
      data: {
        gameId,
        code,
      },
    };

    const host = clients.get(ws);
    if (!host) {
      throw Error('Host does not exist!');
    }

    const game: Game = {
      id: gameId,
      code,
      hostId: host.index,
      questions: data.questions,
      players: [],
      currentQuestion: -1,
      status: 'waiting',
      playerAnswers: new Map(),
    };

    games.set(gameId, game);

    const hostPlayer: Player = { name: host.name, index: host.index, score: 0 };
    game.players.push(hostPlayer);

    const preparedData = JSON.stringify(res);
    ws.send(preparedData);
  } else {
    throw Error('Empty quiz questions');
  }
};
