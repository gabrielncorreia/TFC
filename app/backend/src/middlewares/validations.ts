import { NextFunction, Request, Response } from 'express';
import Service from '../service/service';
import JWT from './jwt/index';

const jwt = new JWT();
const service = new Service();

export default class Validations {
  public login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
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
