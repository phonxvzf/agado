import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import { validUserType } from '../src/common/validator';
import util from './util';

const request = supertest;
const server = index;
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
    const res = await request(server).get('/user?id=abc');
    expect(res.status).toEqual(400);
  });

  it('[GET /user] should succeed', async () => {
    const [{ user_id }] = await database('user').select('user_id')
      .where('username', '=', defaultUserData.username);
    const res = await request(server).get(`/user?user_id=${user_id}`);
    expect(res.status).toEqual(200);
    expect(res.body.password).toBeUndefined();
    expect(res.body.token).toBeUndefined();
    expect(res.body.user_id).toEqual(user_id);
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
    res = await request(server).post('/user/login').send({
      username: user.username,
      password: user.password,
      user_type: user.user_type,
    });
    const { user_id } = res.body; // discard unused token
    res = await request(server).get(`/user?user_id=${user_id}`);
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
    res = await request(server).post('/user/login').send(defaultUserData);
    const { token } = res.body;
    res = await request(server).put('/user').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toEqual(400);
  });

  it('[PUT /user] should succeed', async () => {
    let res = await request(server).post('/user/login').send(defaultUserData);
    const { user_id, token } = res.body;
    const modifiedUser = util.generateUserData();
    res = await request(server).put('/user').send(modifiedUser)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);

    res = await request(server).get(`/user?user_id=${user_id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(modifiedUser.email);
    expect(res.body.username).toEqual(modifiedUser.username);
    expect(res.body.date_of_birth.substr(0, 10)).toEqual(modifiedUser.date_of_birth);

    const [oldPassword] = await database('user').select('password').where('user_id', '=', user_id);

    delete modifiedUser.password;
    res = await request(server).put('/user').set('Authorization', `Bearer ${token}`)
      .send(modifiedUser);
    expect(res.status).toEqual(200);
    const [newPassword] = await database('user').select('password').where('user_id', '=', user_id);
    expect(newPassword).toEqual(oldPassword);
  });
});

describe('Delete user', () => {
  it('[DELETE /user] should fail', async () => {
    let res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: defaultUserData.password,
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(200);
    res = await request(server).del('/user').set('Authorization', `Bearer ${res.body['token']}bad`);
    expect(res.status).toEqual(401);
  });

  it('[DELETE /user] should succeed', async () => {
    let res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: defaultUserData.password,
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(200);
    res = await request(server).del('/user?user_id=-23')
      .set('Authorization', `Bearer ${res.body['token']}`);
    expect(res.status).toEqual(204);
  });
});

describe('Login', () => {
  it('[POST /login] should fail', async () => {
    // empty body
    let res = await request(server).post('/user/login').send({});
    expect(res.status).toEqual(400);

    // invalid user type
    res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: defaultUserData.password,
        user_type: 'BAD USER TYPE',
      });
    expect(res.status).toEqual(400);

    // unmatched user type
    const unmatchedUserTypeSet = new Set(validUserType);
    unmatchedUserTypeSet.delete(defaultUserData.user_type);
    const unmatchedUserTypes = Array.from(unmatchedUserTypeSet);
    for (let i = 0; i < unmatchedUserTypes.length; i += 1) {
      res = await request(server).post('/user/login')
        .send({
          username: defaultUserData.username,
          password: defaultUserData.password,
          user_type: unmatchedUserTypes[i],
        });
      expect(res.status).toEqual(401);
    }

    // incorrect password
    res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: 'DEFINITELY INCORRECT PASSWORD',
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(401);
  });

  it('[POST /login] should succeed', async () => {
    let res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: defaultUserData.password,
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(200);
    expect(res.body.password).toBeUndefined();
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('token');
    const { token } = res.body;

    const modifiedUser = util.generateUserData();
    const [old] = await database.select('*').from('user');
    res = await request(server).put('/user')
      .send(modifiedUser).set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
    const [newData] = await database.select('*').from('user');
    res = await request(server).post('/user/login')
      .send({
        username: modifiedUser.username,
        password: defaultUserData.password,
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(401);
    res = await request(server).post('/user/login')
      .send({
        username: modifiedUser.username,
        password: modifiedUser.password,
        user_type: modifiedUser.user_type,
      });
    expect(res.status).toEqual(200);
  });
});

describe('Logout', () => {
  it('[POST /logout] should fail', async () => {
    let res = await request(server).post('/user/login').send({});
    expect(res.status).toEqual(400);
    res = await request(server).post('/user/logout')
      .set('Authorization', 'Bearer abcd');
    expect(res.status).toEqual(401);
  });

  it('[POST /logout] should succeed', async () => {
    let res = await request(server).post('/user/login')
      .send({
        username: defaultUserData.username,
        password: defaultUserData.password,
        user_type: defaultUserData.user_type,
      });
    expect(res.status).toEqual(200);
    const token = res.body.token;
    res = await request(server)
      .post('/user/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(204);
    res = await request(server).del('/user?user_id=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(401);
  });
});
