import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { app } from '../app';
import Match from '../database/models/Match'
import Team from '../database/models/Team';
import {
  allTeamsMock,
  allMatchesMock,
  leaderboardHomeMockResponse,
  leaderboardAwayMockResponse
} from './mocks/leaderboard-mocks';

import { Response } from 'superagent';
import { assert } from 'console';

chai.use(chaiHttp);

const { expect } = chai;
// const service = new Service();

describe('Testando a rota /leaderboard', () => {
  let chaiHttpResponse: Response;

  before(async () => {
    sinon.stub(Team, "findAll").resolves(allTeamsMock as any);

    sinon.stub(Match, "findAll").resolves(allMatchesMock as any);
  });

  after(()=>{
    (Team.findAll as sinon.SinonStub).restore();
    (Match.findAll as sinon.SinonStub).restore();
  })

  it('GET /leaderboard/home retorna o leaderboard dos times da casa ', async () => {
    chaiHttpResponse = await chai.request(app).get('/leaderboard/home');

    // console.log(leaderboardHomeMockResponse.length)
    // console.log(chaiHttpResponse.body)
    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(chaiHttpResponse.body.length).to.be.equal(leaderboardHomeMockResponse.length);
    expect(chaiHttpResponse.body).to.have.same.deep.members(leaderboardHomeMockResponse);

  });

  it('GET /leaderboard/away retorna o leaderboard dos times visitantes ', async () => {
    chaiHttpResponse = await chai.request(app).get('/leaderboard/away');

    // console.log(leaderboardHomeMockResponse.length)
    // console.log(chaiHttpResponse.body)
    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(chaiHttpResponse.body.length).to.be.equal(leaderboardHomeMockResponse.length);
    expect(chaiHttpResponse.body).to.have.same.deep.members(leaderboardAwayMockResponse);

  });
});
