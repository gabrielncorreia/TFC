import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { app } from '../app';
import Match from '../database/models/Match'
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

  before(async () => {
    sinon.stub(Match, "findAll").resolves(findAllMock as any);

    sinon.stub(Match, "findOne").resolves(findOneMock as any)

    sinon.stub(Match, "create").resolves(createMock as any);

    sinon.stub(Match, "update").resolves(updateMock as any)
  });

  after(()=>{
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
    });

    // console.log(chaiHttpResponse.body);
    expect(chaiHttpResponse.status).to.be.equal(200);;
  });
});
