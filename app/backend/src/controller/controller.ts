import { Request, Response } from 'express';
import JWT from '../middlewares/jwt';
import Service from '../service/service';

const jwt = new JWT();

export default class Controller {
  constructor(private service = new Service()) {}

  public loginUser = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.service.getUserByUsernameAndPassword(email) as any;

    if (!result) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const generatedToken = jwt.generateToken(req.body);
    res.status(200).json({
      user: {
        id: result.id,
        username: result.username,
        role: result.role,
        email: result.email,
      },
      token: generatedToken });
  };

  public validateUser = async (req: Request, res: Response) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(400).json({ message: 'You must provide a JWT Token' });
    }
    const tokenValidation = jwt.validateToken(authorization as string) as any;
    if (tokenValidation.message) {
      return res.status(400).json({ message: tokenValidation.message });
    }
    const { data: { email } } = tokenValidation as any;
    const result = await this.service.getUserByUsernameAndPassword(email) as any;

    res.status(200).json(result.role);
  };

  public getAllTeams = async (req: Request, res: Response) => {
    const result = await this.service.getAllTeams();

    res.status(200).json(result);
  };

  public getTeamById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const team = await this.service.getTeamById(Number(id));

    res.status(200).json(team);
  };

  public getAllMatches = async (req: Request, res: Response) => {
    const { inProgress } = req.query;
    let result;

    if (inProgress) {
      const convertedValue = inProgress === 'true';
      result = await this.service.getAllInProgressMatches(convertedValue);

      return res.status(200).json(result);
    }

    result = await this.service.getAllMatches();
    return res.status(200).json(result);
  };

  public createMatch = async (req: Request, res: Response) => {
    const result = await this.service.createMatch(req.body) as any;

    res.status(201).json({
      id: result.id,
      homeTeam: result.homeTeam,
      homeTeamGoals: result.homeTeamGoals,
      awayTeam: result.awayTeam,
      awayTeamGoals: result.awayTeamGoals,
      inProgress: result.inProgress,
    });
  };

  public finishMatch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const match = await this.service.getMatchById(Number(id)) as any;
    if (!match) {
      return res.status(404).json({
        message: 'This match doesn\'t exist.',
      });
    }
    await this.service.finishMatch(Number(id));

    res.status(200).json({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      inProgress: 0,
    });
  };

  public updateMatch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedMatch = await this.service.updateMatch(Number(id), req.body);

    res.status(200).json(updatedMatch);
  };

  public getHomeLeaderboard = async (_req: Request, res: Response) => {
    const result = await this.service.getHomeLeaderboard();

    res.status(200).json(result);
  };

  public getAwayLeaderboard = async (_req: Request, res: Response) => {
    const result = await this.service.getAwayLeaderboard();

    res.status(200).json(result);
  };

  public getLeaderboard = async (_req: Request, res: Response) => {
    const home = await this.service.getHomeLeaderboard();
    const away = await this.service.getAwayLeaderboard();
    const homePlusAway = [...home, ...away];
    const leaderboard = await this.service.joinBoards(homePlusAway);

    res.status(200).json(leaderboard);
  };
}
