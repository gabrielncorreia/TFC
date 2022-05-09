import User from '../database/models/User';
import Teams from '../database/models/Team';
import Matches from '../database/models/Match';
import Leaderboard from './leaderboard';

export default class Service {
  constructor(
    private user = User,
    private team = Teams,
    private match = Matches,
  ) {}

  public getUserByUsernameAndPassword = async (email: string) => {
    try {
      const user = await this.user.findOne({
        where: {
          email,

        },
      });
      return user;
    } catch (error) {
      return error;
    }
  };

  public getAllTeams = async () => {
    try {
      const teams = await this.team.findAll();
      return teams;
    } catch (error) {
      return error;
    }
  };

  public getTeamById = async (id: number) => {
    try {
      const team = await this.team.findOne({
        where: {
          id,
        },
      });

      return team;
    } catch (error) {
      return error;
    }
  };

  public getAllMatches = async () => {
    try {
      const allMatches = await this.match.findAll({
        include: [
          { model: Teams, as: 'teamHome', attributes: ['teamName'] },
          { model: Teams, as: 'teamAway', attributes: ['teamName'] },
        ],
      });

      return allMatches;
    } catch (error) {
      return error;
    }
  };

  public getAllInProgressMatches = async (value: boolean) => {
    try {
      const allInProgressMatches = await this.match.findAll({
        where: { inProgress: value },
        include: [
          { model: Teams, as: 'teamHome', attributes: ['teamName'] },
          { model: Teams, as: 'teamAway', attributes: ['teamName'] },
        ],
      });

      return allInProgressMatches;
    } catch (error) {
      return error;
    }
  };

  public createMatch = async (match: number[]) => {
    try {
      const createdMatch = await this.match.create(match);

      return createdMatch;
    } catch (error) {
      return error;
    }
  };

  public getMatchById = async (id: number) => {
    try {
      const match = await this.match.findOne({
        where: {
          id,
        },
      });

      return match;
    } catch (error) {
      return error;
    }
  };

  public finishMatch = async (id: number) => {
    try {
      const result = await this.match.update({
        inProgress: false,
      }, {
        where: {
          id,
        },
      });

      return result;
    } catch (error) {
      return error;
    }
  };

  public updateMatch = async (
    id: number,
    { homeTeamGoals, awayTeamGoals }: any,
  ) => {
    try {
      const result = await this.match.update({
        homeTeamGoals,
        awayTeamGoals,
      }, {
        where: {
          id,
        },
      });

      return result;
    } catch (error) {
      return error;
    }
  };

  public getHomeLeaderboard = async () => {
    try {
      const teams = await this.getAllTeams();
      const matches = await this.getAllMatches();
      const leaderboard = new Leaderboard(teams, matches);
      const board = await leaderboard.createLeaderboard();
      return leaderboard.sortLeaderboard(board);
    } catch (error) {
      return error;
    }
  };

  public getAwayLeaderboard = async () => {
    try {
      const teams = await this.getAllTeams();
      const matches = await this.getAllMatches();
      const leaderboard = new Leaderboard(teams, matches);
      const board = await leaderboard.createAwayLeaderboard();
      return leaderboard.sortLeaderboard(board);
    } catch (error) {
      return error;
    }
  };

  public joinBoards = async (board: any) => {
    try {
      const teams = await this.getAllTeams();
      const matches = await this.getAllMatches();
      const leaderboard = new Leaderboard(teams, matches);
      const mergedBoard = await leaderboard.joinBoards(board);
      return leaderboard.sortLeaderboard(mergedBoard);
    } catch (error) {
      return error;
    }
  };
}
