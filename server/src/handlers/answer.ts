import { Game, AnswerData, User } from '../types';
import { WebSocket } from 'ws';
import { sendQuestionResult } from '../utility/sendQuestion';

interface handleAnswerProps {
  data: AnswerData;
  games: Map<string, Game>;
  clients: Map<WebSocket, User>;
  ws: WebSocket;
}

export const handleAnswer = ({ data, games, clients, ws }: handleAnswerProps) => {
  const { gameId, questionIndex, answerIndex } = data;
  const game = Array.from(games.values()).find((g) => g.id === gameId);
  if (!game) throw Error('Game not found');

  const user = clients.get(ws);
  if (!user) throw Error('User not found');

  game.playerAnswers.set(user.index, { answerIndex, timestamp: Date.now() });

  const answer_accepted = { type: 'answer_accepted', data: { questionIndex }, id: 0 };
  ws.send(JSON.stringify(answer_accepted));

  const nonHostPlayers = game.players.filter((player) => player.index !== game.hostId);
  const allAnswered = nonHostPlayers.every((player) => game.playerAnswers.has(player.index));

  if (allAnswered) {
    clearTimeout(game.questionTimer);
    sendQuestionResult(game, clients);
  }
};
