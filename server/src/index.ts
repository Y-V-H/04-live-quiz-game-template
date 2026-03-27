import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { WSMessage } from './types';
import { User } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const users = new Map<string, User>();
// WebSocket server
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const wsMessage: WSMessage = JSON.parse(message.toString());
    const { type, data } = wsMessage;

    const handleReg = (data: User) => {
      const { password, name } = data;
      const user = users.get(name);
      const res = {
        ...wsMessage,
        data: { name, index: '', error: false, errorText: '' },
      };
      if (user) {
        const isValidCredentials = user.password === password && user.name === name;
        if (isValidCredentials) {
          res.data.index = user.index;
        }
      } else {
        if (name === '') {
          res.data.error = true;
          res.data.errorText = 'Invalid user name';
        } else {
          const newUserIndex = randomUUID();
          users.set(name, { ...data, index: newUserIndex });
          res.data.index = newUserIndex;
        }
      }
      const preparedData = JSON.stringify(res);
      ws.send(preparedData);
    };

    switch (type) {
      case 'reg':
        handleReg(data);
        break;
      case 'create_game':
        console.log(1);
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