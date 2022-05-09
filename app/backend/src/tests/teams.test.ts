import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { app } from '../app';
import Example from '../database/models/ExampleModel';
import Team from '../database/models/Team'
import { findOneMock, findAllMock } from './mocks/team-mocks';

import { Response } from 'superagent';
import { assert } from 'console';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando a rota /teams', () => {
  let chaiHttpResponse: Response;

  before(async () => {
    sinon
      .stub(Team, "findAll")
      .resolves(findAllMock as Team[]);

    sinon.stub(Team, "findOne").resolves(findOneMock as Team)
  });

  after(()=>{
    (Team.findAll as sinon.SinonStub).restore();
    (Team.findOne as sinon.SinonStub).restore();
  })

  it('GET /teams retorna status 200 e um array contendo todos os times com id e teamName.', async () => {
    chaiHttpResponse = await chai.request(app).get('/teams');
    const { id, teamName } = chaiHttpResponse.body[0] as any;
    const { id: id2, teamName: tm2 } = chaiHttpResponse.body[1] as any;

    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(chaiHttpResponse.body.length).to.be.equal(16);
    expect(id).to.exist;
    expect(id).to.be.equal(1);
    expect(teamName).to.exist;
    expect(teamName).to.be.equal('Avaí/Kindermann');
    expect(id2).to.exist;
    expect(id2).to.be.equal(2);
    expect(tm2).to.exist;
    expect(tm2).to.be.equal('Bahia');
    // console.log(chaiHttpResponse.body.length);
    // console.log(chaiHttpResponse.status);
    // console.log(id, username, role, email, token)

  });

  it('GET /teams/:id retorna status 200 e determinado time com aquele id.', async () => {
    chaiHttpResponse = await chai.request(app).get('/teams/1')

    const { id, teamName } = chaiHttpResponse.body as any;

    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(id).to.exist;
    expect(id).to.be.equal(1);
    expect(teamName).to.exist;
    expect(teamName).to.be.equal('Avaí/Kindermann');
  });
});
