interface Teams {
  id: number,
  teamName: string
}

interface Matches {
  id: number,
  homeTeam: number,
  homeTeamGoals: number,
  awayTeam: number,
  awayTeamGoals: number,
  inProgress: boolean,
  teamHome: {
    teamName: string;
  },
  teamAway: {
    teamName: string;
  }
}

export { Teams, Matches };
