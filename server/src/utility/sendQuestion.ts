import { Game, User } from '../types';
import { WebSocket } from 'ws';

export const sendQuestionResult = (game: Game, clients: Map<WebSocket, User>) => {
  const question = game.questions[game.currentQuestion];
  const startTime = game.questionStartTime || Date.now();

  const playerResults = game.players
    .filter((player) => player.index !== game.hostId)
    .map((player) => {
      const answer = game.playerAnswers.get(player.index);
      const answered = !!answer;
      const correct = answered && answer.answerIndex === question.correctIndex;
      const timeRemaining = correct
        ? Math.max(0, question.timeLimitSec - (answer.timestamp - startTime) / 1000)
        : 0;
      const pointsEarned = correct ? Math.round(1000 * (timeRemaining / question.timeLimitSec)) : 0;

      player.score += pointsEarned;

      return { name: player.name, answered, correct, pointsEarned, totalScore: player.score };
    });

  const resultMsg = {
    type: 'question_result',
    data: {
      questionIndex: game.currentQuestion,
      correctIndex: question.correctIndex,
      playerResults,
    },
    id: 0,
  };

  clients.forEach((user, ws) => {
    if (game.players.some((player) => player.index === user.index)) {
      ws.send(JSON.stringify(resultMsg));
    }
  });

  game.playerAnswers.clear();
  game.currentQuestion++;

  if (game.currentQuestion < game.questions.length) {
    const next = game.questions[game.currentQuestion];
    game.questionStartTime = Date.now();
    const nextMsg = {
      type: 'question',
      data: {
        questionNumber: game.currentQuestion + 1,
        totalQuestions: game.questions.length,
        text: next.text,
        options: next.options,
        timeLimitSec: next.timeLimitSec,
      },
      id: 0,
    };
    clients.forEach((user, ws) => {
      if (game.players.some((player) => player.index === user.index)) {
        ws.send(JSON.stringify(nextMsg));
      }
    });
    game.questionTimer = setTimeout(() => {
      sendQuestionResult(game, clients);
    }, next.timeLimitSec * 1000);
  } else {
    game.status = 'finished';
    const scoreboard = game.players
      .filter((player) => player.index !== game.hostId)
      .sort((a, b) => b.score - a.score)
      .map((player, i) => ({ name: player.name, score: player.score, rank: i + 1 }));

    const finishMsg = { type: 'game_finished', data: { scoreboard }, id: 0 };
    clients.forEach((user, ws) => {
      if (game.players.some((p) => p.index === user.index)) {
        ws.send(JSON.stringify(finishMsg));
      }
    });
  }
};
