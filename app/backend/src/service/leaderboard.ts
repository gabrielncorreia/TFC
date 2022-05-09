// import { Teams, Matches } from '../interfaces/interfaces';

export default class Leaderboard {
  private teams: any;

  private matches: any;

  constructor(teams: any, matches: any) {
    this.teams = teams;
    this.matches = matches;
  }

  private calculateVictories = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      if (match.homeTeamGoals > match.awayTeamGoals) {
        count += 1;
      }
      return count;
    });

    return count;
  };

  private cDraws = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      if (match.homeTeamGoals === match.awayTeamGoals) {
        count += 1;
      }
      return count;
    });

    return count;
  };

  private calculateLosses = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      if (match.homeTeamGoals < match.awayTeamGoals) {
        count += 1;
      }
      return count;
    });

    return count;
  };

  private cTP = (victories: number, draws: number) => { // calcular Total de Pontos
    let points = 0;

    for (let i = 0; i < victories; i += 1) {
      points += 3;
    }
    for (let i = 0; i < draws; i += 1) {
      points += 1;
    }

    return points;
  };

  private calculateFavorGoals = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      count += match.homeTeamGoals;
      return '';
    });

    return count;
  };

  private calculateEnemyGoals = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      count += match.awayTeamGoals;
      return '';
    });

    return count;
  };

  private calculateGoalsBalance = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      count += (match.homeTeamGoals - match.awayTeamGoals);
      return '';
    });

    return count;
  };

  private calculateEfficiency = (totalPoints: number, matchesLength: number) => {
    const result = (totalPoints / (matchesLength * 3)) * 100;

    if (result >= 100) {
      return 100;
    }

    return Number(result.toFixed(2));
  };

  public createLeaderboard = () => {
    const { teams, matches } = this;
    return teams.map((team: any) => {
      const fMatches = matches.filter((match: any) =>
        match.teamHome.teamName === team.teamName && match.inProgress === false);
      const vic = this.calculateVictories(fMatches);
      return {
        name: team.teamName,
        totalPoints: this.cTP(vic, this.cDraws(fMatches)),
        totalGames: fMatches.length,
        totalVictories: vic,
        totalDraws: this.cDraws(fMatches),
        totalLosses: this.calculateLosses(fMatches),
        goalsFavor: this.calculateFavorGoals(fMatches),
        goalsOwn: this.calculateEnemyGoals(fMatches),
        goalsBalance: this.calculateGoalsBalance(fMatches),
        efficiency: this.calculateEfficiency(this.cTP(vic, this.cDraws(fMatches)), fMatches.length),
      };
    });
  };

  // Away:
  public calculateAwayVictories = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      if (match.awayTeamGoals > match.homeTeamGoals) {
        count += 1;
      }
      return count;
    });

    return count;
  };

  private calcAwayLosses = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      if (match.awayTeamGoals < match.homeTeamGoals) {
        count += 1;
      }
      return count;
    });

    return count;
  };

  private calcAwayGoalsBalance = (matches: any) => {
    let count = 0;
    matches.map((match: any) => {
      count += (match.awayTeamGoals - match.homeTeamGoals);
      return '';
    });

    return count;
  };

  public createAwayLeaderboard = () => {
    const { teams, matches } = this;
    return teams.map((team: any) => {
      const fMatches = matches.filter((match: any) =>
        match.teamAway.teamName === team.teamName && match.inProgress === false);
      const vic = this.calculateAwayVictories(fMatches);
      return {
        name: team.teamName,
        totalPoints: this.cTP(vic, this.cDraws(fMatches)),
        totalGames: fMatches.length,
        totalVictories: vic,
        totalDraws: this.cDraws(fMatches),
        totalLosses: this.calcAwayLosses(fMatches),
        goalsFavor: this.calculateEnemyGoals(fMatches), // Os gols do adversário do homeTeam são os gols do awayTeam
        goalsOwn: this.calculateFavorGoals(fMatches), // Os gols que o homeTeam fez são os gols que o awayTeam levou.
        goalsBalance: this.calcAwayGoalsBalance(fMatches),
        efficiency: this.calculateEfficiency(this.cTP(vic, this.cDraws(fMatches)), fMatches.length),
      };
    });
  };

  // Both boards
  private sumProperty = (matches: any, property: string) => {
    const sumValue = matches.reduce((prev: any, curr: any) => prev + curr[property], 0);

    if (property === 'efficiency') {
      const totalPoints = matches.reduce((prev: any, curr: any) => prev + curr.totalPoints, 0);
      const totalGames = matches.reduce((prev: any, curr: any) => prev + curr.totalGames, 0);
      const efficiency = (totalPoints / (totalGames * 3)) * 100;

      if (Number.isInteger(efficiency)) return efficiency;

      return Number(efficiency).toFixed(2);
    }

    return sumValue;
  };

  public joinBoards = (leaderboard: any) => {
    const { teams } = this;
    return teams.map((team: any) => {
      const teamMatches = leaderboard.filter((board: any) => board.name === team.teamName);

      return {
        // name: team.name,
        name: team.teamName,
        totalPoints: this.sumProperty(teamMatches, 'totalPoints'),
        totalGames: this.sumProperty(teamMatches, 'totalGames'),
        totalVictories: this.sumProperty(teamMatches, 'totalVictories'),
        totalDraws: this.sumProperty(teamMatches, 'totalDraws'),
        totalLosses: this.sumProperty(teamMatches, 'totalLosses'),
        goalsFavor: this.sumProperty(teamMatches, 'goalsFavor'),
        goalsOwn: this.sumProperty(teamMatches, 'goalsOwn'),
        goalsBalance: this.sumProperty(teamMatches, 'goalsBalance'),
        efficiency: this.sumProperty(teamMatches, 'efficiency'),
        // matches: teamMatches,
      };
    });
  };

  public sortLeaderboard = (leaderboard: any) => {
    // Ordem para desempate
    // 1º Total de Vitórias; 2º Saldo de gols; 3º Gols a favor; 4º Gols contra.
    leaderboard.sort((a: any, b: any) => {
      // first by totalPoints
      if (b.totalPoints > a.totalPoints) return 1;
      if (b.totalPoints < a.totalPoints) return -1;

      // then by totalVictories
      if (b.totalVictories > a.totalVictories) return 1;
      if (b.totalVictories < a.totalVictories) return -1;

      // then by goalsBalance
      if (b.goalsBalance > a.goalsBalance) return 1;
      if (b.goalsBalance < a.goalsBalance) return -1;

      // than by goalsFavor
      if (b.goalsFavor > a.goalsFavor) return 1;
      if (b.goalsFavor < a.goalsFavor) return -1;

      // than by goalsOwn
      if (b.goalsOwn > a.goalsOwn) return 1;
      if (b.goalsOwn < a.goalsOwn) return -1;

      return 0;
    });

    return leaderboard;
  };
}
