import * as chai from 'chai';
import * as sinon from 'sinon';
import * as bcrypt from 'bcryptjs';
import chaiHttp = require('chai-http');

import { app, App } from '../app';
import User from '../database/models/User';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testando CORS', () => {
  it('Responde à origem do front end local', async () => {
    const response = await chai.request(app).options('/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.header['access-control-allow-origin']).to.be.equal('http://localhost:3000');
  });

  it('Não libera outras origens', async () => {
    const response = await chai.request(app).options('/login')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.header['access-control-allow-origin']).to.not.exist;
  });

  it('Aceita a lista de origens de CORS_ORIGINS', async () => {
    process.env.CORS_ORIGINS = 'https://gabrielncorreia.github.io,http://localhost:3000';
    const deployed = new App().app;
    delete process.env.CORS_ORIGINS;

    const allowed = await chai.request(deployed).options('/login')
      .set('Origin', 'https://gabrielncorreia.github.io')
      .set('Access-Control-Request-Method', 'POST');
    const refused = await chai.request(deployed).options('/login')
      .set('Origin', 'https://gabrielncorreia.github.io.evil.example')
      .set('Access-Control-Request-Method', 'POST');

    expect(allowed.header['access-control-allow-origin']).to.be.equal('https://gabrielncorreia.github.io');
    expect(refused.header['access-control-allow-origin']).to.not.exist;
  });
});

describe('Testando o seeder de usuários', () => {
  const seeder = require('../database/seeders/20211205212238-user.js');
  const saved = { ...process.env };
  const seededPasswords = async () => {
    let rows: any[] = [];
    await seeder.up({ bulkInsert: async (_table: string, data: any[]) => { rows = data; } });
    return rows.map(({ password }) => password);
  };

  afterEach(() => { process.env = { ...saved }; });

  it('Em produção, recusa semear sem ADMIN_PASSWORD e USER_PASSWORD', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_PASSWORD;
    delete process.env.USER_PASSWORD;

    let error: any;
    await seededPasswords().catch((e) => { error = e; });

    expect(error).to.exist;
    expect(error.message).to.be.equal('ADMIN_PASSWORD must be set');
  });

  it('Em produção, guarda o hash das senhas do ambiente, não as senhas públicas', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'admin-de-producao';
    process.env.USER_PASSWORD = 'user-de-producao';

    const [admin, user] = await seededPasswords();

    expect(await bcrypt.compare('admin-de-producao', admin)).to.be.true;
    expect(await bcrypt.compare('user-de-producao', user)).to.be.true;
    expect(await bcrypt.compare('secret_admin', admin)).to.be.false;
  });

  it('Localmente, usa os logins públicos de desenvolvimento', async () => {
    delete process.env.NODE_ENV;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.USER_PASSWORD;

    const [admin, user] = await seededPasswords();

    expect(await bcrypt.compare('secret_admin', admin)).to.be.true;
    expect(await bcrypt.compare('secret_user', user)).to.be.true;
  });
});

describe('Testando o limite de tentativas de login', () => {
  afterEach(() => {
    sinon.restore();
    process.env.LOGIN_RATE_LIMIT = '1000';
  });

  it('Bloqueia a 11ª tentativa de login com 429', async () => {
    process.env.LOGIN_RATE_LIMIT = '10';
    const limited = new App().app;
    sinon.stub(User, 'findOne').resolves(null);
    const attempt = () => chai.request(limited).post('/login')
      .send({ email: 'ninguem@admin.com', password: 'chute' });

    for (let i = 0; i < 10; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      expect((await attempt()).status).to.be.equal(401);
    }
    const blocked = await attempt();

    expect(blocked.status).to.be.equal(429);
    expect(blocked.body).to.deep.equal({ message: 'Too many login attempts, try again later' });
  });
});

describe('Testando a configuração do banco', () => {
  const configPath = require.resolve('../database/config/database');
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
    delete require.cache[configPath];
  });

  it('Em produção, falha sem as credenciais em vez de usar os valores locais', () => {
    process.env.NODE_ENV = 'production';
    ['DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST', 'DB_PORT'].forEach((name) => delete process.env[name]);
    delete require.cache[configPath];

    expect(() => require('../database/config/database')).to.throw('Missing or invalid database settings');
  });

  it('Em produção, falha com uma porta inválida em vez de usar a porta local', () => {
    Object.assign(process.env, {
      NODE_ENV: 'production', DB_USER: 'u', DB_PASS: 'p', DB_NAME: 'n', DB_HOST: 'h', DB_PORT: 'abc',
    });
    delete require.cache[configPath];

    expect(() => require('../database/config/database')).to.throw('DB_PORT');
  });

  it('Em produção, usa as credenciais do ambiente', () => {
    Object.assign(process.env, {
      NODE_ENV: 'production', DB_USER: 'u', DB_PASS: 'p', DB_NAME: 'n', DB_HOST: 'h', DB_PORT: '4000',
    });
    delete require.cache[configPath];

    expect(require('../database/config/database')).to.include({ username: 'u', password: 'p', port: 4000 });
  });

  it('Com DB_SSL=true, conecta com TLS 1.2 verificado', () => {
    process.env.DB_SSL = 'true';
    delete require.cache[configPath];

    expect(require('../database/config/database').dialectOptions).to.deep.equal({
      timezone: 'Z',
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    });
  });

  it('Sem DB_SSL, não usa TLS', () => {
    delete process.env.DB_SSL;
    delete require.cache[configPath];

    expect(require('../database/config/database').dialectOptions).to.deep.equal({ timezone: 'Z' });
  });
});
