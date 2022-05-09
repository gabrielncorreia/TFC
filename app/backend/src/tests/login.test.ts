import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { app } from '../app';
import Example from '../database/models/ExampleModel';
import User from '../database/models/User'
import { findOneMock } from './mocks/login-mocks';

import { Response } from 'superagent';
import { assert } from 'console';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando a rota /login', () => {
  /**
   * Exemplo do uso de stubs com tipos
   */

  let chaiHttpResponse: Response;

  before(async () => {
    sinon
      .stub(User, "findOne")
      .resolves(findOneMock as User); // Sempre quando o método findOne do model User for chamado, ele irá retornar o findOneMock.
  });

  after(()=>{
    (User.findOne as sinon.SinonStub).restore();
  })

  it('POST /login com um usuário valido retorna status 200 e um objeto contendo id, username, role, email e token.', async () => {
    chaiHttpResponse = await chai.request(app).post('/login')
    .send({
      email: 'admin@admin.com',
      password: 'senha_super_segura'
    });
    const { user: { id, username, role, email }, token } = chaiHttpResponse.body as any;

    expect(chaiHttpResponse.status).to.be.equal(200);
    expect(id).to.exist;
    expect(id).to.be.equal(1);
    expect(username).to.exist;
    expect(username).to.be.equal('Admin');
    expect(role).to.exist;
    expect(role).to.be.equal('admin');
    expect(email).to.exist;
    expect(email).to.be.equal('admin@admin.com');
    expect(token).to.exist;
    expect(token).to.be.a.string;
    // console.log(chaiHttpResponse.body);
    // console.log(chaiHttpResponse.status);
    // console.log(id, username, role, email, token)

  });

  it('POST /login sem um email do body retorna um erro.', async () => {
    chaiHttpResponse = await chai.request(app).post('/login')
    .send({
      password: 'senha_super_segura'
    })

    const { message } = chaiHttpResponse.body;
    // console.log(chaiHttpResponse.status);
    // expect(false).to.be.eq(false);
    expect(message).to.exist;
    expect(message).to.be.a.string;
    expect(message).to.be.equal('All fields must be filled');
    expect(chaiHttpResponse.status).to.be.equal(400);
  });

  it('POST /login sem um password no body retorna um erro.', async () => {
    chaiHttpResponse = await chai.request(app).post('/login')
    .send({
      email: 'admin@admin.com'
    })

    const { message } = chaiHttpResponse.body;
    // console.log(message);
    expect(message).to.exist;
    expect(message).to.be.a.string;
    expect(message).to.be.equal('All fields must be filled');
    expect(chaiHttpResponse.status).to.be.equal(400);
  })

  it('POST /login sem um body retorna um erro.', async () => {
    chaiHttpResponse = await chai.request(app).post('/login')

    const { message } = chaiHttpResponse.body;
    // console.log(chaiHttpResponse.status);
    expect(message).to.exist;
    expect(message).to.be.a.string;
    expect(message).to.be.equal('All fields must be filled');
    expect(chaiHttpResponse.status).to.be.equal(400);
  })

  it('GET /login/validate com um token válido retorna a role do usuário', async () => {
    const firstChaiHttpResponse = await chai.request(app).post('/login')
    .send({
      email: 'admin@admin.com',
      password: 'senha_super_segura'
    });
    const { token } = firstChaiHttpResponse.body as any;
    chaiHttpResponse = await chai.request(app).get('/login/validate')
    .set(
      'authorization', token
    )

    // console.log(firstChaiHttpResponse.body)
    expect(chaiHttpResponse.body).to.be.equal('admin');
    expect(chaiHttpResponse.status).to.be.equal(200);
  })

  it('GET /login/validate sem um header retorna um erro', async () => {
    chaiHttpResponse = await chai.request(app).get('/login/validate')

    // console.log(chaiHttpResponse.status)
    const { message } = chaiHttpResponse.body;
    expect(message).to.exist;
    expect(message).to.be.a.string
    expect(message).to.be.equal('You must provide a JWT Token');
    expect(chaiHttpResponse.status).to.be.equal(400);
  })
});