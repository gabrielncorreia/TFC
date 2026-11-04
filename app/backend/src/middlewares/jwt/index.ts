import 'dotenv/config';
import * as jwt from 'jsonwebtoken';

const Secret = process.env.JWT_SECRET;
if (!Secret) throw new Error('JWT_SECRET must be set');

export default class JWT {
  constructor(private secret: string = Secret as string) {}

  public generateToken = (credentials: any) => {
    const token = jwt.sign({ data: credentials }, this.secret, {
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    return token;
  };

  public validateToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      return decoded;
    } catch (error) {
      return error;
    }
  };
}
