import { randomUUID } from 'crypto';
import { WSMessage, User } from '../types';
import type { WebSocket } from 'ws';
interface handleRegProps {
  data: User;
  users: Map<string, User>;
  wsMessage: WSMessage;
  ws: WebSocket;
  clients: Map<WebSocket, User>;
}

export const handleReg = ({ data, users, wsMessage, ws, clients }: handleRegProps) => {
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
      clients.set(ws, user);
    }
  } else {
    if (name === '') {
      res.data.error = true;
      res.data.errorText = 'Invalid user name';
    } else {
      const newUserIndex = randomUUID();
      const userData = { ...data, index: newUserIndex };

      users.set(name, userData);
      clients.set(ws, userData);
      res.data.index = newUserIndex;
    }
  }
  const preparedData = JSON.stringify(res);
  ws.send(preparedData);
};
