import * as sinon from 'sinon';
import chai = require('chai');
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

  it('GET /leaderboard soma casa e visitante de cada time e ordena por pontos', async () => {
    chaiHttpResponse = await chai.request(app).get('/leaderboard');
    const board = chaiHttpResponse.body as any[];

    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(board.length).to.be.equal(allTeamsMock.length);
    board.forEach((row) => {
      const home = leaderboardHomeMockResponse.find(({ name }) => name === row.name) as any;
      const away = leaderboardAwayMockResponse.find(({ name }) => name === row.name) as any;
      ['totalPoints', 'totalGames', 'totalVictories', 'goalsFavor', 'goalsOwn'].forEach((key) => {
        expect(row[key], `${row.name} ${key}`).to.be.equal(home[key] + away[key]);
      });
    });
    board.slice(1).forEach((row, i) => {
      expect(row.totalPoints).to.be.at.most(board[i].totalPoints);
    });
  });
});
