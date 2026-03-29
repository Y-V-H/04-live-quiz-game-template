import { User, Game, StartGameData } from '../types';
import type { WebSocket } from 'ws';
import { sendQuestionResult } from '../utility/sendQuestion';

interface handelStartGameProps {
  data: StartGameData;
  games: Map<string, Game>;
  clients: Map<WebSocket, User>;
}

export const handelStartGame = ({ data, games, clients }: handelStartGameProps) => {
  const game = Array.from(games.values()).find((game) => game.id === data.gameId);
  if (!game) throw Error('Game not found');

  game.status = 'in_progress';
  game.currentQuestion = 0;
  game.questionStartTime = Date.now();

  const question = game.questions[0];

  const questionMsg = {
    type: 'question',
    data: {
      questionNumber: 1,
      totalQuestions: game.questions.length,
      text: question.text,
      options: question.options,
      timeLimitSec: question.timeLimitSec,
    },
    id: 0,
  };

  clients.forEach((user, ws) => {
    if (game.players.some((player) => player.index === user.index)) {
      ws.send(JSON.stringify(questionMsg));
    }
  });

  game.questionTimer = setTimeout(() => {
    sendQuestionResult(game, clients);
  }, question.timeLimitSec * 1000);
};
