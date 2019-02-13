import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import util from './util';
import httpStatus from '../src/common/http-status';
import { hotelManagerRepo } from '../src/model/hotel_manager';

const request = supertest;
const server = index;
const db = database;

const travelerData = util.generateUserData();
travelerData.user_type = 'traveler';

const pmtHotelManagerData = util.generateUserData();
pmtHotelManagerData.user_type = 'hotel_manager';

const noHotelManagerData = util.generateUserData();
noHotelManagerData.user_type = 'hotel_manager';

const reqHotelManagerData = util.generateUserData();
reqHotelManagerData.user_type = 'hotel_manager';

const hotelData = util.generateHotelData();

let travelerId: number;
let travelerToken: string;
let pmtHotelManagerId: number;
let pmtHotelManagerToken: string;
let noHotelManagerId: number;
let noHotelManagerToken: string;
let reqHotelManagerId: number;
let reqHotelManagerToken: string;

let hotelId: number;

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(travelerData);
  resTraveler = await request(server).post('/login').send(travelerData);
  travelerId = resTraveler.body.id;
  travelerToken = resTraveler.body.token;

  let resPmtHotelManager = await request(server).post('/user').send(pmtHotelManagerData);
  resPmtHotelManager = await request(server).post('/login').send(pmtHotelManagerData);
  pmtHotelManagerId = resPmtHotelManager.body.id;
  pmtHotelManagerToken = resPmtHotelManager.body.token;

  let resNoHotelManager = await request(server).post('/user').send(noHotelManagerData);
  resNoHotelManager = await request(server).post('/login').send(noHotelManagerData);
  noHotelManagerId = resNoHotelManager.body.id;
  noHotelManagerToken = resNoHotelManager.body.token;

  let resReqHotelManager = await request(server).post('/user').send(reqHotelManagerData);
  resReqHotelManager = await request(server).post('/login').send(reqHotelManagerData);
  reqHotelManagerId = resReqHotelManager.body.id;
  reqHotelManagerToken = resReqHotelManager.body.token;

  let resHotel = await request(server)
    .post('/hotel')
    .set('Authorization', `Bearer ${pmtHotelManagerToken}`)
    .send(hotelData);
  hotelId = resHotel.body.id;

  done();
});

beforeEach(async (done) => {
  await util.addHotelManager({
    uid: pmtHotelManagerId,
    hid: hotelId,
    permitted: 'pmt'
  });
  await util.addHotelManager({
    uid: noHotelManagerId,
    hid: hotelId,
    permitted: 'no'
  });
  await util.addHotelManager({
    uid: reqHotelManagerId,
    hid: hotelId,
    permitted: 'req'
  });

  done();
});

afterEach(async (done) => {
  await util.wipeHotelManagers();
  await server.close();
  done();
});

afterAll(async (done) => {
  await util.wipeUsers();
  await util.wipeHotels();
  done();
});

describe('Get hotel manager information', () => {
  it('[GET /hotelManager] should fail (not logged on)', async () => {
    const res = await request(server).get('/hotelManager?hotel_id=1');
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[GET /hotelManager] should fail (traveler access)', async () => {
    const res = await request(server)
      .get('/hotelManager?hotel_id=1')
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[GET /hotelManager] should succeed (hotel manager access)', async () => {
    const res = await request(server)
      .get(`/hotelManager?hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${pmtHotelManagerToken}`);
    expect(res.status).toEqual(httpStatus.OK.code);
  });
});

// describe('Create hotel manager information', () => {
//   it('[POST /hotelManager] should fail (not logged on)', async () => {
//     const res = await request(server).post('/hotelManager');
//     expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
//   });

//   it('[GET /hotelManager] should fail (traveler access)', async () => {
//     const res = await request(server)
//       .get('/hotelManager?hotel_id=' + hotelId)
//       .set('Authorization', `Bearer ${travelerToken}`);
//     expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
//   });

//   it('[GET /hotelManager] should fail (traveler access)', async () => {
//     const res = await request(server)
//       .get('/hotelManager?hotel_id=1')
//       .set('Authorization', `Bearer ${travelerToken}`);
//     expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
//   });
// });
