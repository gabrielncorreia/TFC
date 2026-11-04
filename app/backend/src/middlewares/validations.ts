import { NextFunction, Request, Response } from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import Service from '../service/service';
import JWT from './jwt/index';

const jwt = new JWT();
const service = new Service();

const sha256 = (value: string) => createHash('sha256').update(value).digest();

export default class Validations {
  // Vercel cron sends `Authorization: Bearer <CRON_SECRET>`; without the variable the route stays closed.
  public cronSecret = (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.CRON_SECRET;
    const given = req.headers.authorization || '';

    if (!secret || !timingSafeEqual(sha256(given), sha256(`Bearer ${secret}`))) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  };

  public login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'All fields must be filled' });
    }

    next();
  };

  public token = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(400).json({ message: 'You must provide a JWT Token' });
    }
    const tokenValidation = jwt.validateToken(authorization as string);
    const { message: m } = tokenValidation as any;

    if (m) return res.status(400).json({ message: m });

    res.locals.user = (tokenValidation as any).data;
    next();
  };

  // Runs after `token`; the role comes from the signed token, so a client cannot change it.
  public admin = (_req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change matches' });
    }

    next();
  };

  public createMatch = async (req: Request, res: Response, next: NextFunction) => {
    const { homeTeam, awayTeam } = req.body;

    if (homeTeam === awayTeam) {
      return res.status(401).json({
        message: 'It is not possible to create a match with two equal teams',
      });
    }

    const homeTeamExist = await service.getTeamById(homeTeam);
    const awayTeamExist = await service.getTeamById(awayTeam);

    if (!homeTeamExist || !awayTeamExist) {
      return res.status(404).json({
        message: 'There is no team with such id!',
      });
    }

    next();
  };
}
