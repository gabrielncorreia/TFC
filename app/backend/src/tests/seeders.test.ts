import * as chai from 'chai';

const { expect } = chai;

const rowsFrom = async (seederFile: string) => {
  const seeder = require(`../database/seeders/${seederFile}`);
  let rows: any[] = [];
  await seeder.up({ bulkInsert: async (_table: string, data: any[]) => { rows = data; } });
  return rows;
};

describe('Testando os seeders', () => {
  it('Os times do seeder têm ids 1 a 16, na ordem atual', async () => {
    const teams = await rowsFrom('20211116145440-teams.js');

    expect(teams.map(({ id }) => id)).to.deep.equal(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(teams[0].team_name).to.be.equal('Avaí/Kindermann');
  });

  it('Toda partida do seeder aponta para times existentes', async () => {
    const teamIds = (await rowsFrom('20211116145440-teams.js')).map(({ id }) => id);
    const matches = await rowsFrom('20211116145458-matches.js');

    expect(matches).to.have.length(48);
    matches.forEach(({ home_team: home, away_team: away }) => {
      expect(teamIds).to.include(home);
      expect(teamIds).to.include(away);
    });
  });
});
