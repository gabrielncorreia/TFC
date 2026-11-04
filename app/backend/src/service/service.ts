import User from '../database/models/User';
import Teams from '../database/models/Team';
import Matches from '../database/models/Match';
import Leaderboard from './leaderboard';

// Database errors are not caught here: they propagate to the error handler in app.ts as a 500.
export default class Service {
  constructor(
    private user = User,
    private team = Teams,
    private match = Matches,
  ) {}

  public getUserByEmail = async (email: string) => {
    const user = await this.user.findOne({
      where: {
        email,

      },
    });
    return user;
  };

  public getAllTeams = async () => {
    const teams = await this.team.findAll();
    return teams;
  };

  public getTeamById = async (id: number) => {
    const team = await this.team.findOne({
      where: {
        id,
      },
    });

    return team;
  };

  public getAllMatches = async () => {
    const allMatches = await this.match.findAll({
      include: [
        { model: Teams, as: 'teamHome', attributes: ['teamName'] },
        { model: Teams, as: 'teamAway', attributes: ['teamName'] },
      ],
    });

    return allMatches;
  };

  public getAllInProgressMatches = async (value: boolean) => {
    const allInProgressMatches = await this.match.findAll({
      where: { inProgress: value },
      include: [
        { model: Teams, as: 'teamHome', attributes: ['teamName'] },
        { model: Teams, as: 'teamAway', attributes: ['teamName'] },
      ],
    });

    return allInProgressMatches;
  };

  public createMatch = async (match: Record<string, unknown>) => {
    const createdMatch = await this.match.create(match);

    return createdMatch;
  };

  public getMatchById = async (id: number) => {
    const match = await this.match.findOne({
      where: {
        id,
      },
    });

    return match;
  };

  public finishMatch = async (id: number) => {
    const result = await this.match.update({
      inProgress: false,
    }, {
      where: {
        id,
      },
    });

    return result;
  };

  public updateMatch = async (
    id: number,
    { homeTeamGoals, awayTeamGoals }: any,
  ) => {
    const result = await this.match.update({
      homeTeamGoals,
      awayTeamGoals,
    }, {
      where: {
        id,
      },
    });

    return result;
  };

  public getHomeLeaderboard = async () => {
    const teams = await this.getAllTeams();
    const matches = await this.getAllMatches();
    const leaderboard = new Leaderboard(teams, matches);
    const board = await leaderboard.createLeaderboard();
    return leaderboard.sortLeaderboard(board);
  };

  public getAwayLeaderboard = async () => {
    const teams = await this.getAllTeams();
    const matches = await this.getAllMatches();
    const leaderboard = new Leaderboard(teams, matches);
    const board = await leaderboard.createAwayLeaderboard();
    return leaderboard.sortLeaderboard(board);
  };

  public joinBoards = async (board: any) => {
    const teams = await this.getAllTeams();
    const matches = await this.getAllMatches();
    const leaderboard = new Leaderboard(teams, matches);
    const mergedBoard = await leaderboard.joinBoards(board);
    return leaderboard.sortLeaderboard(mergedBoard);
  };
}
