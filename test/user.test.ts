import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import util from './util';

const request = supertest;
const server = index;
const db = database;

beforeEach(async (done) => {
  done();
});

afterEach(async (done) => {
  await util.wipeUsers();
  await server.close();
  done();
});

describe('Get user information', () => {
  it('[GET /user] should fail', async () => {
    const res = await request(server).get('/user?id=99999999');
    expect(res.status).toEqual(404);
  });

  it('[GET /user] should succeed', async () => {
    const [userId] = await util.generateUser();
    const res = await request(server).get(`/user?id=${userId}`);
    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(userId);
  });
});

describe('Create user', () => {
  it('[POST /user] should fail', async () => {
    const res = await request(server).post('/user').send({});
    expect(res.status).toEqual(400);
  });

  it('[POST /user] should succeed', async () => {
    const user = util.generateUserData();
    let res = await request(server).post('/user').send(user);
    expect(res.status).toEqual(201);
    res = await request(server).get(`/user?id=${res.body.id}`);
    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(user.email);
    expect(res.body.username).toEqual(user.username);
    expect(res.body.date_of_birth.substr(0, 10)).toEqual(user.date_of_birth);
  });
});

describe('Modify user', () => {
  it('[PUT /user] should fail', async () => {
    const res = await request(server).put('/user').send({});
    expect(res.status).toEqual(400);
  });

  it('[PUT /user] should succeed', async () => {
    const [userId] = await util.generateUser();
    const modifiedUser = util.generateUserData();
    modifiedUser['id'] = userId;
    let res = await request(server).put('/user').send(modifiedUser);
    expect(res.status).toEqual(200);
    res = await request(server).get(`/user?id=${userId}`);
    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(modifiedUser.email);
    expect(res.body.username).toEqual(modifiedUser.username);
    expect(res.body.date_of_birth.substr(0, 10)).toEqual(modifiedUser.date_of_birth);
  });
});

describe('Delete user', () => {
  it('[DELETE /user] should fail', async () => {
    const res = await request(server).del('/user').send({});
    expect(res.status).toEqual(400);
  });

  it('[DELETE /user] should succeed', async () => {
    const [id] = await util.generateUser();
    let res = await request(server).del('/user').send({ id });
    expect(res.status).toEqual(204);
    res = await request(server).get(`/user?id=${id}`);
    expect(res.status).toEqual(404);
    res = await request(server).del('/user').send({ id: 9999999 });
    expect(res.status).toEqual(204);
  });
});

describe('Login', () => {
  it('[POST /login] should fail', async () => {
    const res = await request(server).post('/login').send({});
    expect(res.status).toEqual(400);
  });

  it('[POST /login] should succeed', async () => {
    const user = util.generateUserData();
    let res = await request(server).post('/user').send(user);
    expect(res.status).toEqual(201);
    res = await request(server).post('/login')
      .send({ username: user.username, password: 'DEFINITELY INCORRECT PASSWORD' });
    expect(res.status).toEqual(401);
    res = await request(server).post('/login')
      .send({ username: user.username, password: user.password });
    expect(res.status).toEqual(200);

    const modifiedUser = util.generateUserData();
    modifiedUser['id'] = res.body.id;
    res = await request(server).put('/user').send(modifiedUser);
    expect(res.status).toEqual(200);
    res = await request(server).post('/login')
      .send({ username: modifiedUser.username, password: user.password });
    expect(res.status).toEqual(401);
    res = await request(server).post('/login')
      .send({ username: modifiedUser.username, password: modifiedUser.password });
    expect(res.status).toEqual(200);
  });
});

/* TODO
describe('Logout', () => {
  it('[POST /logout] should fail', async () => {
    let res = await request(server).post('/login').send({});
    expect(res.status).toEqual(400);
    res = await request(server).post('/login').send({ id: 0 });
    expect(res.status).toEqual(401);
    res = await request(server).post('/login').send({ id: 99999999 });
    expect(res.status).toEqual(404);
  });

  it('[POST /logout] should succeed', async () => {
  });
});
 */
