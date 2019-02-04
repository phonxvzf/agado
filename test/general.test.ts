import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';

const request = supertest;
const server = index;
const db = database;

beforeAll(async () => {
  // TODO
});

afterAll(async () => {
  // TODO
  server.close();
});

describe('Database Connection', () => {
  it('Delete all, insert, select', async () => {
    await db.del('code').from('test');
    await db.insert({
      code: 2541,
    }).into('test');
    const [row] = await db.select('code').from('test');
    expect(row.code).toEqual(2541);
  });
});

describe('General Endpoints', () => {
  it('[GET /ping]', async () => {
    const res = await request(server).get('/ping');
    expect(res.status).toEqual(200);
    expect(res.text).toEqual('pong');
  });

  it('[POST /ping]', async () => {
    const res = await request(server).post('/ping').send({});
    expect(res.status).toEqual(200);
    expect(res.text).toEqual('pong');
  });
});
