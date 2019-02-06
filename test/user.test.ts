import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import util from './util';

const request = supertest;
const server = index;
const db = database;
const defaultUserData = util.generateUserData();

beforeEach(async (done) => {
  await util.addUser(defaultUserData);
  done();
});

afterEach(async (done) => {
  await util.wipeUsers();
  await server.close();
  done();
});

describe('Get user information', () => {
  it('[GET /user] should fail', async () => {
    const res = await request(server).get('/user?id=100');
    expect(res.status).toEqual(401);
  });

  it('[GET /user] should succeed', async () => {
    let res = await request(server).post('/login').send(defaultUserData);
    const { id, token } = res.body;
    res = await request(server).get('/user').set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(id);
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
    res = await request(server).post('/login').send(user);
    const { id, token } = res.body;
    res = await request(server).get('/user').set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(user.email);
    expect(res.body.username).toEqual(user.username);
    expect(res.body.date_of_birth.substr(0, 10)).toEqual(user.date_of_birth);
  });
});

describe('Modify user', () => {
  it('[PUT /user] should fail', async () => {
    let res = await request(server).put('/user').send({});
    expect(res.status).toEqual(401);
    res = await request(server).post('/login').send(defaultUserData);
    const { id, token } = res.body;
    res = await request(server).put('/user').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toEqual(400);
  });

  it('[PUT /user] should succeed', async () => {
    let res = await request(server).post('/login').send(defaultUserData);
    const { id, token } = res.body;
    const modifiedUser = util.generateUserData();
    res = await request(server).put('/user').send(modifiedUser)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);

    res = await request(server).get('/user').set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(modifiedUser.email);
    expect(res.body.username).toEqual(modifiedUser.username);
    expect(res.body.date_of_birth.substr(0, 10)).toEqual(modifiedUser.date_of_birth);

    const [oldPassword] = await database('user').select('password').where('id', '=', id);

    delete modifiedUser.password;
    res = await request(server).put('/user').set('Authorization', `Bearer ${token}`)
      .send(modifiedUser);
    expect(res.status).toEqual(200);
    const [newPassword] = await database('user').select('password').where('id', '=', id);
    expect(newPassword).toEqual(oldPassword);
  });
});

describe('Delete user', () => {
  it('[DELETE /user] should fail', async () => {
    let res = await request(server).post('/login')
      .send({ username: defaultUserData.username, password: defaultUserData.password });
    expect(res.status).toEqual(200);
    res = await request(server).del('/user').set('Authorization', `Bearer ${res.body['token']}bad`);
    expect(res.status).toEqual(401);
  });

  it('[DELETE /user] should succeed', async () => {
    let res = await request(server).post('/login')
      .send({ username: defaultUserData.username, password: defaultUserData.password });
    expect(res.status).toEqual(200);
    res = await request(server).del('/user').set('Authorization', `Bearer ${res.body['token']}`);
    expect(res.status).toEqual(204);
  });
});

describe('Login', () => {
  it('[POST /login] should fail', async () => {
    const res = await request(server).post('/login').send({});
    expect(res.status).toEqual(400);
  });

  it('[POST /login] should succeed', async () => {
    let res = await request(server).post('/login')
      .send({ username: defaultUserData.username, password: 'DEFINITELY INCORRECT PASSWORD' });
    expect(res.status).toEqual(401);
    res = await request(server).post('/login')
      .send({ username: defaultUserData.username, password: defaultUserData.password });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('token');
    const { token } = res.body;

    const modifiedUser = util.generateUserData();
    const [old] = await database.select('*').from('user');
    res = await request(server).put('/user')
      .send(modifiedUser).set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    const [newData] = await database.select('*').from('user');
    res = await request(server).post('/login')
      .send({ username: modifiedUser.username, password: defaultUserData.password });
    expect(res.status).toEqual(401);
    res = await request(server).post('/login')
      .send({ username: modifiedUser.username, password: modifiedUser.password });
    expect(res.status).toEqual(200);
  });
});

describe('Logout', () => {
  it('[POST /logout] should fail', async () => {
    let res = await request(server).post('/login').send({});
    expect(res.status).toEqual(400);
    res = await request(server).post('/logout').set('Authorization', 'Bearer abcd');
    expect(res.status).toEqual(401);
  });

  it('[POST /logout] should succeed', async () => {
    let res = await request(server).post('/login')
      .send({ username: defaultUserData.username, password: defaultUserData.password });
    expect(res.status).toEqual(200);
    const token = res.body.token;
    res = await request(server)
      .post('/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(204);
    res = await request(server)
      .get('/user?id=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(401);
  });
});
