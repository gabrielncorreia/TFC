import db from '../database/models';

// The seeders are the single source of the demo data; allowJs copies them into build/.
const seeders: Record<string, { up: (queryInterface: unknown) => Promise<void> }> = {
  users: require('../database/seeders/20211205212238-user.js'),
  teams: require('../database/seeders/20211116145440-teams.js'),
  matches: require('../database/seeders/20211116145458-matches.js'),
};

type SeedRows = { users: object[], teams: object[], matches: object[] };

export const seedRows = async (): Promise<SeedRows> => {
  const rows: Record<string, object[]> = {};
  const recorder = { bulkInsert: async (table: string, data: object[]) => { rows[table] = data; } };
  await Promise.all(Object.values(seeders).map((seeder) => seeder.up(recorder)));
  return rows as SeedRows;
};

// One transaction: visitors never see empty tables, and a failure rolls back to the old data.
const resetDemo = async () => {
  const rows = await seedRows();
  const queryInterface = db.getQueryInterface();

  await db.transaction(async (transaction) => {
    // Children before parents, so the foreign keys from matches to teams always hold.
    await queryInterface.bulkDelete('matches', {}, { transaction });
    await queryInterface.bulkDelete('teams', {}, { transaction });
    await queryInterface.bulkDelete('users', {}, { transaction });
    await queryInterface.bulkInsert('users', rows.users, { transaction });
    await queryInterface.bulkInsert('teams', rows.teams, { transaction });
    await queryInterface.bulkInsert('matches', rows.matches, { transaction });
  });

  return { users: rows.users.length, teams: rows.teams.length, matches: rows.matches.length };
};

export default resetDemo;
