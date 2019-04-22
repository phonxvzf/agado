import supertest from 'supertest';
import index from '../src/index';
import util from './util';
import httpStatus from '../src/common/http-status';

const request = supertest;
const server = index;

const defaultTravelerData = util.generateUserData();
defaultTravelerData.user_type = 'traveler';

const defaultHotelManagerData = util.generateUserData();
defaultHotelManagerData.user_type = 'hotel_manager';

const defaultHotelData = util.generateHotelData();

let travelerToken: string;
let hotelManagerToken: string;

let hotelId: number;

// Test after user.test

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(defaultTravelerData);
  resTraveler = await request(server).post('/user/login').send(defaultTravelerData);
  travelerToken = resTraveler.body.token;

  let resHotelManager = await request(server).post('/user').send(defaultHotelManagerData);
  resHotelManager = await request(server).post('/user/login').send(defaultHotelManagerData);
  hotelManagerToken = resHotelManager.body.token;

  done();
});

beforeEach(async (done) => {
  [hotelId] = await util.addHotel(defaultHotelData);
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
      .get(`/hotel?hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.body['hotel_id']).toEqual(hotelId);
    expect(res.status).toEqual(httpStatus.OK.code);
  });

  it('[GET /hotel] should succeed (hotel manager access)', async () => {
    const res = await request(server)
      .get(`/hotel?hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(httpStatus.OK.code);
  });

  it('[GET /hotel] should fail (hotel not exists)', async () => {
    const res = await request(server)
      .get('/hotel?hotel_id=2000000')
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(httpStatus.NOT_FOUND.code);
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
      .set('Authorization', `Bearer ${travelerToken}`)
      .send(defaultHotelData);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[POST /hotel] should succeed (hotel access)', async () => {
    const res = await request(server)
      .post('/hotel')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send(defaultHotelData);
    expect(res.status).toEqual(httpStatus.CREATED.code);
  });

  it('[POST /hotel] should fail (insufficient information)', async () => {
    const res = await request(server)
      .post('/hotel')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({});
    expect(res.status).toEqual(httpStatus.BAD_REQUEST.code);
  });
});

describe('Edit hotel data', () => {
  it('[PUT /hotel] should fail (not logged on)', async () => {
    const res = await request(server).put('/hotel').send({});
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[PUT /hotel] should fail (traveler access)', async () => {
    const res = await request(server)
      .put('/hotel')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({});
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  // Test after hotel_manager.test -- TODO
  // it('[PUT /hotel] should succeed (hotel access)', async () => {
  //   const completeHotelData = Object.assign({ id: hotelId }, defaultHotelData);
  //   const res = await request(server)
  //     .put('/hotel')
  //     .set('Authorization', `Bearer ${hotelManagerToken}`)
  //     .send(completeHotelData);
  //   console.log(res.body);
  //   expect(res.status).toEqual(httpStatus.OK.code);
  // });

  it('[PUT /hotel] should fail (insufficient information)', async () => {
    const res = await request(server)
      .put('/hotel')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({});
    expect(res.status).toEqual(httpStatus.BAD_REQUEST.code);
  });
});

describe('Delete hotel data', () => {
  it('[DEL /hotel] should fail (not logged on)', async () => {
    const res = await request(server).del('/hotel').send({});
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[DEL /hotel] should fail (traveler access)', async () => {
    const res = await request(server)
      .del('/hotel')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({});
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  // Test after hotel_manager.test -- TODO
  // it('[DEL /hotel] should succeed (hotel access)', async () => {
  //   const completeHotelData = Object.assign({ id: hotelId }, defaultHotelData);
  //   const res = await request(server)
  //     .del('/hotel')
  //     .set('Authorization', `Bearer ${hotelManagerToken}`)
  //     .send(completeHotelData);
  //   console.log(res.body);
  //   expect(res.status).toEqual(httpStatus.NO_CONTENT.code);
  // });

  it('[DEL /hotel] should fail (insufficient information)', async () => {
    const res = await request(server)
      .del('/hotel')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({});
    expect(res.status).toEqual(httpStatus.BAD_REQUEST.code);
  });
});
