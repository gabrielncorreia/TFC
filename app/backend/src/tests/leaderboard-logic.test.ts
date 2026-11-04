import chai = require('chai');

import Leaderboard from '../service/leaderboard';

const { expect } = chai;

// A small league worked out by hand. Delta has no finished matches.
const teams = ['Alfa', 'Beta', 'Gama', 'Delta'].map((teamName, i) => ({ id: i + 1, teamName }));

const match = (home: string, homeGoals: number, away: string, awayGoals: number, inProgress = false) => ({
  homeTeamGoals: homeGoals,
  awayTeamGoals: awayGoals,
  inProgress,
  teamHome: { teamName: home },
  teamAway: { teamName: away },
});

const matches = [
  match('Alfa', 2, 'Beta', 0),
  match('Beta', 1, 'Alfa', 1),
  match('Alfa', 3, 'Gama', 1),
  match('Gama', 0, 'Beta', 0),
  match('Alfa', 5, 'Gama', 0, true), // still in progress: must not count
];

const byName = (board: any[], name: string) => board.find((row) => row.name === name);

describe('Testando o cálculo do leaderboard', () => {
  const leaderboard = new Leaderboard(teams, matches);

  it('Classificação da casa: pontos, resultados, gols e aproveitamento', () => {
    const board = leaderboard.createLeaderboard();

    expect(byName(board, 'Alfa')).to.deep.equal({
      name: 'Alfa',
      totalPoints: 6,
      totalGames: 2,
      totalVictories: 2,
      totalDraws: 0,
      totalLosses: 0,
      goalsFavor: 5,
      goalsOwn: 1,
      goalsBalance: 4,
      efficiency: 100,
    });
    expect(byName(board, 'Beta')).to.include({ totalPoints: 1, totalDraws: 1, efficiency: 33.33 });
  });

  it('Partidas em andamento não entram na classificação', () => {
    const board = leaderboard.createLeaderboard();

    expect(byName(board, 'Alfa').totalGames).to.be.equal(2);
    expect(byName(board, 'Alfa').goalsFavor).to.be.equal(5);
  });

  it('Classificação de visitante: os gols do visitante são os gols a favor', () => {
    const board = leaderboard.createAwayLeaderboard();

    expect(byName(board, 'Beta')).to.deep.equal({
      name: 'Beta',
      totalPoints: 1,
      totalGames: 2,
      totalVictories: 0,
      totalDraws: 1,
      totalLosses: 1,
      goalsFavor: 0,
      goalsOwn: 2,
      goalsBalance: -2,
      efficiency: 16.67,
    });
    expect(byName(board, 'Gama')).to.include({ totalLosses: 1, goalsFavor: 1, goalsOwn: 3 });
  });

  it('Time sem partidas finalizadas tem tudo zerado, inclusive o aproveitamento', () => {
    const home = byName(leaderboard.createLeaderboard(), 'Delta');
    const away = byName(leaderboard.createAwayLeaderboard(), 'Delta');
    const total = byName(leaderboard.joinBoards([home, away]), 'Delta');

    [home, away, total].forEach((row) => {
      expect(row).to.include({ totalPoints: 0, totalGames: 0, goalsBalance: 0 });
      expect(Number(row.efficiency)).to.be.equal(0);
    });
  });

  it('Classificação geral soma casa e visitante e recalcula o aproveitamento pelo total', () => {
    const both = [...leaderboard.createLeaderboard(), ...leaderboard.createAwayLeaderboard()];
    const alfa = byName(leaderboard.joinBoards(both), 'Alfa');

    expect(alfa).to.include({
      totalPoints: 7,
      totalGames: 3,
      totalVictories: 2,
      totalDraws: 1,
      totalLosses: 0,
      goalsFavor: 6,
      goalsOwn: 2,
      goalsBalance: 4,
    });
    // 7 of 9 possible points, not the average of 100 and 33.33.
    expect(Number(alfa.efficiency)).to.be.equal(77.78);
  });

  it('Ordena por pontos, depois vitórias, saldo de gols e gols a favor', () => {
    const row = (name: string, totalPoints: number, totalVictories: number, goalsBalance: number, goalsFavor: number) => ({
      name, totalPoints, totalVictories, goalsBalance, goalsFavor, goalsOwn: goalsFavor - goalsBalance,
    });
    const board = [
      row('poucosPontos', 1, 0, 0, 0),
      row('menosVitorias', 4, 0, 5, 5),
      row('piorSaldo', 4, 1, 1, 9),
      row('menosGols', 4, 1, 2, 2),
      row('maisGols', 4, 1, 2, 5),
    ];

    expect(leaderboard.sortLeaderboard(board).map(({ name }: any) => name)).to.deep.equal([
      'maisGols', 'menosGols', 'piorSaldo', 'menosVitorias', 'poucosPontos',
    ]);
  });
});
