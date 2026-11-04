import * as sinon from 'sinon';
import chai = require('chai');
import bcrypt = require('bcryptjs');
import chaiHttp = require('chai-http');

import { app } from '../app';
import JWT from '../middlewares/jwt';
import User from '../database/models/User';
import Team from '../database/models/Team';
import Match from '../database/models/Match';
import { findOneMock as userMock } from './mocks/login-mocks';
import { findOneMock as teamMock } from './mocks/team-mocks';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando falhas do banco de dados', () => {
  const token = new JWT().generateToken({ email: 'admin@admin.com', role: 'admin' });
  const dbError = new Error('connect ECONNREFUSED 10.0.0.1:3306');

  beforeEach(() => {
    sinon.stub(console, 'error'); // the handler logs the error; keep test output clean
  });

  afterEach(() => sinon.restore());

  const expectHidden500 = (response: any) => {
    expect(response.status).to.be.equal(500);
    expect(response.body).to.deep.equal({ message: 'Internal server error' });
    expect((console.error as sinon.SinonStub).calledWith(dbError)).to.be.true;
  };

  it('POST /login retorna 500 e nenhum token quando o banco falha', async () => {
    sinon.stub(User, 'findOne').rejects(dbError);
    const response = await chai.request(app).post('/login')
      .send({ email: 'admin@admin.com', password: 'senha_super_segura' });

    expectHidden500(response);
  });

  it('POST /matches retorna 500 em vez de 201 quando o banco falha ao criar', async () => {
    sinon.stub(Team, 'findOne').resolves(teamMock as any);
    sinon.stub(Match, 'create').rejects(dbError);
    const response = await chai.request(app).post('/matches')
      .send({ homeTeam: 16, awayTeam: 8, homeTeamGoals: 1, awayTeamGoals: 1 })
      .set({ authorization: token });

    expectHidden500(response);
  });

  it('POST /matches retorna 500 em vez de aceitar os times quando o banco falha ao validá-los', async () => {
    sinon.stub(Team, 'findOne').rejects(dbError);
    const create = sinon.stub(Match, 'create');
    const response = await chai.request(app).post('/matches')
      .send({ homeTeam: 16, awayTeam: 8, homeTeamGoals: 1, awayTeamGoals: 1 })
      .set({ authorization: token });

    expectHidden500(response);
    expect(create.called).to.be.false;
  });

  it('PATCH /matches/:id/finish retorna 500 em vez de 200 quando o banco falha', async () => {
    sinon.stub(Match, 'findOne').rejects(dbError);
    const response = await chai.request(app).patch('/matches/1/finish')
      .set({ authorization: token });

    expectHidden500(response);
  });

  it('GET /leaderboard retorna 500 em vez de travar quando o banco falha', async () => {
    sinon.stub(Team, 'findAll').rejects(dbError);
    const response = await chai.request(app).get('/leaderboard');

    expectHidden500(response);
  });
});

describe('Testando outras respostas de erro', () => {
  afterEach(() => sinon.restore());

  it('Um JSON malformado retorna 400, não 500', async () => {
    const response = await chai.request(app).post('/login')
      .set('content-type', 'application/json')
      .send('{"email": ');

    expect(response.status).to.be.equal(400);
  });

  it('POST /login com um email desconhecido também compara a senha, como um email existente', async () => {
    const compare = sinon.spy(bcrypt, 'compare');
    const findOne = sinon.stub(User, 'findOne');

    findOne.resolves(null);
    const unknown = await chai.request(app).post('/login')
      .send({ email: 'ninguem@admin.com', password: 'senha_super_segura' });
    findOne.resolves(userMock as User);
    const wrong = await chai.request(app).post('/login')
      .send({ email: 'admin@admin.com', password: 'senha_errada' });

    expect(unknown.status).to.be.equal(401);
    expect(wrong.status).to.be.equal(401);
    expect(unknown.body).to.deep.equal(wrong.body);
    expect(compare.callCount).to.be.equal(2);
  });
});
