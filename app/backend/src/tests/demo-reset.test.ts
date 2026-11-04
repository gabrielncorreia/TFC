import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import appDefault, { app } from '../app';
import db from '../database/models';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando o reset noturno da demonstração', () => {
  const transaction = { id: 'fake-transaction' };
  let calls: { method: string, table: string, rows?: number, transaction: unknown }[];
  let failInsertOn: string | undefined;

  beforeEach(() => {
    calls = [];
    failInsertOn = undefined;
    process.env.CRON_SECRET = 'segredo-do-cron';
    sinon.stub(console, 'error');
    sinon.stub(db, 'transaction').callsFake((async (work: any) => work(transaction)) as any);
    sinon.stub(db, 'getQueryInterface').returns({
      bulkDelete: async (table: string, _where: object, options: any) => {
        calls.push({ method: 'delete', table, transaction: options.transaction });
      },
      bulkInsert: async (table: string, rows: object[], options: any) => {
        if (table === failInsertOn) throw new Error('insert failed');
        calls.push({ method: 'insert', table, rows: rows.length, transaction: options.transaction });
      },
    } as any);
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.CRON_SECRET;
  });

  const reset = (authorization?: string) => {
    const request = chai.request(app).get('/demo/reset');
    return authorization ? request.set('authorization', authorization) : request;
  };

  it('Sem Authorization retorna 401 e não toca no banco', async () => {
    const response = await reset();

    expect(response.status).to.be.equal(401);
    expect(response.body).to.deep.equal({ message: 'Unauthorized' });
    expect(calls).to.be.empty;
  });

  it('Com o segredo errado retorna 401', async () => {
    const response = await reset('Bearer outro-segredo');

    expect(response.status).to.be.equal(401);
    expect(calls).to.be.empty;
  });

  it('Sem CRON_SECRET configurado retorna 401 mesmo com um header', async () => {
    delete process.env.CRON_SECRET;
    const response = await reset('Bearer ');

    expect(response.status).to.be.equal(401);
    expect(calls).to.be.empty;
  });

  it('Com o segredo certo apaga partidas, times e usuários e insere de novo, nessa ordem, numa transação', async () => {
    const response = await reset('Bearer segredo-do-cron');

    expect(response.status).to.be.equal(200);
    expect(calls.map(({ method, table }) => `${method} ${table}`)).to.deep.equal([
      'delete matches', 'delete teams', 'delete users',
      'insert users', 'insert teams', 'insert matches',
    ]);
    calls.forEach((call) => expect(call.transaction).to.be.equal(transaction));
  });

  it('Retorna a quantidade de linhas inseridas', async () => {
    const response = await reset('Bearer segredo-do-cron');

    expect(response.body).to.deep.equal({ users: 2, teams: 16, matches: 48 });
  });

  it('Rodar duas vezes deixa o mesmo resultado', async () => {
    await reset('Bearer segredo-do-cron');
    const first = [...calls];
    calls = [];
    await reset('Bearer segredo-do-cron');

    expect(calls).to.deep.equal(first);
  });

  it('Se uma inserção falha, o erro chega à transação e a rota retorna 500', async () => {
    failInsertOn = 'matches';
    const response = await reset('Bearer segredo-do-cron');

    expect(response.status).to.be.equal(500);
    expect(response.body).to.deep.equal({ message: 'Internal server error' });
  });

  it('O app exporta o Express como default', () => {
    expect(appDefault).to.be.equal(app);
  });
});
