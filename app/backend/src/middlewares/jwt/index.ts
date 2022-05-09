import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

const Secret = readFileSync('jwt.evaluation.key', 'utf-8');

export default class JWT {
  constructor(private secret = Secret) {}

  public generateToken = (credentials: any) => {
    const token = jwt.sign({ data: credentials }, this.secret, {
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    return token;
  };

  public validateToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded;
    } catch (error) {
      return error;
    }
  };
}
