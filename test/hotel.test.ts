import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import util from './util';
import httpStatus from '../src/common/http-status';

const request = supertest;
const server = index;
const db = database;

const defaultTravelerData = util.generateUserData();
defaultTravelerData.user_type = 'traveler';

const defaultHotelManagerData = util.generateUserData();
defaultHotelManagerData.user_type = 'hotel_manager';

const defaultHotelData = util.generateHotelData();

let idTraveler: number;
let tokenTraveler: string;
let idHotelManager: number;
let tokenHotelManager: string;

let hid: number;

// Test after user.test

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(defaultTravelerData);
  idTraveler = resTraveler.body.id;

  resTraveler = await request(server).post('/login').send(defaultTravelerData);
  tokenTraveler = resTraveler.body.token;

  let resHotelManager = await request(server).post('/user').send(defaultHotelManagerData);
  idHotelManager = resHotelManager.body.id;

  resHotelManager = await request(server).post('/login').send(defaultHotelManagerData);
  tokenHotelManager = resHotelManager.body.token;

  done();
});

beforeEach(async (done) => {
  [hid] = await util.addHotel(defaultHotelData);
  done();
});

afterEach(async (done) => {
  await util.wipeHotels();
  await server.close();
  done();
});

afterAll(async (done) => {
  await util.wipeUsers();
  done();
});

describe('Get hotel information', () => {
  it('[GET /hotel] should fail (not logged on)', async () => {
    const res = await request(server).get('/hotel?id=100');
    expect(res.status).toEqual(401);
  });

  it('[GET /hotel] should succeed (traveler access)', async () => {
    const res = await request(server)
      .get('/hotel?id=' + hid)
      .set('Authorization', `Bearer ${tokenTraveler}`);
    expect(res.body['id']).toEqual(hid);
    expect(res.status).toEqual(httpStatus.OK.code);
  });

  it('[GET /hotel] should succeed (hotel manager access)', async () => {
    const res = await request(server)
      .get('/hotel?id=' + hid)
      .set('Authorization', `Bearer ${tokenHotelManager}`);
    expect(res.status).toEqual(httpStatus.OK.code);
  });

  it('[GET /hotel] should fail (hotel not exists)', async () => {
    const res = await request(server)
      .get('/hotel?id=2000000')
      .set('Authorization', `Bearer ${tokenHotelManager}`);
    expect(res.status).toEqual(404);
  });
});

describe('Create hotel', () => {
  it('[POST /hotel] should fail (not logged on)', async () => {
    const res = await request(server).post('/hotel').send({});
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[POST /hotel] should fail (traveler access)', async () => {
    const res = await request(server)
      .post('/hotel')
      .set('Authorization', `Bearer ${tokenTraveler}`)
      .send(defaultHotelData);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[POST /hotel] should succeed (hotel access)', async () => {
    const res = await request(server)
      .post('/hotel')
      .set('Authorization', `Bearer ${tokenHotelManager}`)
      .send(defaultHotelData);
    expect(res.status).toEqual(httpStatus.CREATED.code);
  });
});
