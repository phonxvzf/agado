import supertest from 'supertest';
import index from '../src/index';

const request = supertest;
const server = index;

beforeAll(async () => {
  // TODO
});

afterAll(async () => {
  // TODO
  server.close();
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
