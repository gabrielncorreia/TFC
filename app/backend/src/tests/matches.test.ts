import * as sinon from 'sinon';
import chai = require('chai');
import chaiHttp = require('chai-http');

import { app } from '../app';
import Match from '../database/models/Match'
import User from '../database/models/User'
import Team from '../database/models/Team';
import * as jsonwebtoken from 'jsonwebtoken';
import JWT from '../middlewares/jwt';
import { findOneMock as userMock } from './mocks/login-mocks';
import { findOneMock as teamMock } from './mocks/team-mocks';
import {
  findOneMock,
  findAllMock,
  createMock,
  updateMock
} from './mocks/match-mocks';

import { Response } from 'superagent';
import { assert } from 'console';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando a rota /matches', () => {
  let chaiHttpResponse: Response;
  const token = new JWT().generateToken({ email: 'admin@admin.com', role: 'admin' });

  before(async () => {
    sinon.stub(User, "findOne").resolves(userMock as User);

    sinon.stub(Team, "findOne").resolves(teamMock as any);

    sinon.stub(Match, "findAll").resolves(findAllMock as any);

    sinon.stub(Match, "findOne").resolves(findOneMock as any)

    sinon.stub(Match, "create").resolves(createMock as any);

    sinon.stub(Match, "update").resolves(updateMock as any)
  });

  after(()=>{
    (User.findOne as sinon.SinonStub).restore();
    (Team.findOne as sinon.SinonStub).restore();
    (Match.findAll as sinon.SinonStub).restore();
    (Match.findOne as sinon.SinonStub).restore();
    (Match.create as sinon.SinonStub).restore();
    (Match.update as sinon.SinonStub).restore();
  })

  it('GET /matches retorna todas as partidas ', async () => {
    chaiHttpResponse = await chai.request(app).get('/matches');
    const { id,
      homeTeam,
      homeTeamGoals,
      awayTeam,
      awayTeamGoals,
      inProgress,
      teamHome: { teamName },
    teamAway: { teamName: teamNameAway } } = chaiHttpResponse.body[0] as any;

    // console.log(chaiHttpResponse.body.length)
    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(chaiHttpResponse.body.length).to.be.equal(48);
    expect(id).to.exist;
    expect(id).to.be.equal(1);
    expect(homeTeam).to.exist;
    expect(homeTeam).to.be.equal(16);
    expect(homeTeamGoals).to.exist;
    expect(homeTeamGoals).to.be.equal(1);
    expect(awayTeam).to.exist;
    expect(awayTeam).to.be.equal(8);
    expect(awayTeamGoals).to.exist;
    expect(awayTeamGoals).to.be.equal(1);
    expect(inProgress).to.exist;
    expect(inProgress).to.be.equal(false);
    expect(teamName).to.exist;
    expect(teamName).to.be.equal('São Paulo');
    expect(teamNameAway).to.exist;
    expect(teamNameAway).to.be.equal('Grêmio');

  });

  it('POST /matches cria uma partida com sucesso.', async () => {
    const chaiHttpResponseLogin = await chai.request(app).post('/login')
    .send({
      email: 'admin@admin.com',
      password: 'senha_super_segura'
    });
    const { token } = chaiHttpResponseLogin.body as any;
    chaiHttpResponse = await chai.request(app).post('/matches').send({
        "homeTeam": 16,
        "awayTeam": 8,
        "homeTeamGoals": 2,
        "awayTeamGoals": 2,
        "inProgress": true
    }).set({ 'authorization': token })

    const {
      id,
      homeTeam,
      homeTeamGoals,
      awayTeam,
      awayTeamGoals,
      inProgress
    } = chaiHttpResponse.body as any;

    expect(chaiHttpResponse.status).to.be.equal(201);
    // console.log(chaiHttpResponse.body)
    expect(id).to.exist;
    expect(id).to.be.equal(1);
    expect(homeTeam).to.exist;
    expect(homeTeam).to.be.equal(16);
    expect(awayTeam).to.exist;
    expect(awayTeam).to.be.equal(8);
    expect(homeTeamGoals).to.exist;
    expect(homeTeamGoals).to.be.equal(2);
    expect(awayTeamGoals).to.exist;
    expect(awayTeamGoals).to.be.equal(2);
    expect(inProgress).to.exist;
    expect(inProgress).to.be.equal(true);
  });

  it('PATCH /matches/:id/finish finaliza uma partida com sucesso', async () => {
    chaiHttpResponse = await chai.request(app).patch('/matches/1/finish')
      .set({ 'authorization': token });

    // console.log(chaiHttpResponse.body);

    const { homeTeam, awayTeam, inProgress } = chaiHttpResponse.body as any;

    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(homeTeam).to.exist;
    expect(homeTeam).to.be.equal(16);
    expect(awayTeam).to.exist;
    expect(awayTeam).to.be.equal(8);
    expect(inProgress).to.exist;
    expect(inProgress).to.be.equal(0);
  });

  it('PATCH /matches/:id atualiza uma partida', async () => {
    chaiHttpResponse = await chai.request(app).patch('/matches/1').send({
      "homeTeamGoals": 3,
      "awayTeamGoals": 1
    }).set({ 'authorization': token });

    // console.log(chaiHttpResponse.body);
    expect(chaiHttpResponse.status).to.be.equal(200);;
  });

  it('PATCH /matches/:id e /matches/:id/finish sem token retornam um erro', async () => {
    const update = await chai.request(app).patch('/matches/1').send({ homeTeamGoals: 9 });
    const finish = await chai.request(app).patch('/matches/1/finish');

    expect(update.status).to.be.equal(400);
    expect(finish.status).to.be.equal(400);
    expect((Match.update as sinon.SinonStub).calledWith(sinon.match({ homeTeamGoals: 9 }))).to.be.false;
  });

  it('GET /matches?inProgress filtra pelas partidas em andamento ou finalizadas', async () => {
    const findAll = Match.findAll as sinon.SinonStub;

    await chai.request(app).get('/matches?inProgress=true');
    expect(findAll.lastCall.args[0].where).to.deep.equal({ inProgress: true });

    await chai.request(app).get('/matches?inProgress=false');
    expect(findAll.lastCall.args[0].where).to.deep.equal({ inProgress: false });
  });

  it('POST /matches com dois times iguais retorna um erro', async () => {
    chaiHttpResponse = await chai.request(app).post('/matches')
      .send({ homeTeam: 8, awayTeam: 8, homeTeamGoals: 1, awayTeamGoals: 1 })
      .set({ 'authorization': token });

    expect(chaiHttpResponse.status).to.be.equal(401);
    expect(chaiHttpResponse.body.message).to.be.equal('It is not possible to create a match with two equal teams');
  });

  it('POST /matches com um time inexistente retorna 404', async () => {
    (Team.findOne as sinon.SinonStub).resolves(null);
    chaiHttpResponse = await chai.request(app).post('/matches')
      .send({ homeTeam: 99, awayTeam: 8, homeTeamGoals: 1, awayTeamGoals: 1 })
      .set({ 'authorization': token });
    (Team.findOne as sinon.SinonStub).resolves(teamMock as any);

    expect(chaiHttpResponse.status).to.be.equal(404);
    expect(chaiHttpResponse.body.message).to.be.equal('There is no team with such id!');
  });

  it('POST /matches recusa token ausente, forjado ou expirado', async () => {
    const body = { homeTeam: 16, awayTeam: 8, homeTeamGoals: 1, awayTeamGoals: 1 };
    const forged = jsonwebtoken.sign({ data: { email: 'admin@admin.com', role: 'admin' } }, 'outro-segredo');
    const expired = jsonwebtoken.sign(
      { data: { email: 'admin@admin.com', role: 'admin' }, exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET as string,
    );
    const create = Match.create as sinon.SinonStub;
    const callsBefore = create.callCount;

    const missing = await chai.request(app).post('/matches').send(body);
    const withForged = await chai.request(app).post('/matches').send(body).set({ 'authorization': forged });
    const withExpired = await chai.request(app).post('/matches').send(body).set({ 'authorization': expired });

    expect(missing.status).to.be.equal(400);
    expect(withForged.status).to.be.equal(400);
    expect(withExpired.status).to.be.equal(400);
    expect(create.callCount).to.be.equal(callsBefore);
  });

  it('PATCH /matches/:id/finish de uma partida inexistente retorna 404', async () => {
    (Match.findOne as sinon.SinonStub).resolves(null);
    chaiHttpResponse = await chai.request(app).patch('/matches/999/finish')
      .set({ 'authorization': token });
    (Match.findOne as sinon.SinonStub).resolves(findOneMock as any);

    expect(chaiHttpResponse.status).to.be.equal(404);
  });

  it('PATCH /matches/:id altera somente o placar', async () => {
    await chai.request(app).patch('/matches/1')
      .send({ homeTeamGoals: 3, awayTeamGoals: 1, inProgress: false, homeTeam: 1 })
      .set({ 'authorization': token });

    const [fields, options] = (Match.update as sinon.SinonStub).lastCall.args;
    expect(fields).to.deep.equal({ homeTeamGoals: 3, awayTeamGoals: 1 });
    expect(options).to.deep.equal({ where: { id: 1 } });
  });
});
