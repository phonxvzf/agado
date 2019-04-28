import supertest from 'supertest';
import index from '../src/index';
import util from './util';
import httpStatus from '../src/common/http-status';

const request = supertest;
const server = index;

const defaultTravelerData = {
  user_type: 'traveler',
  username: 'traveler',
  password: 'traveler',
  first_name: 'traveler',
  last_name: 'traveler',
  gender: 'Male',
  date_of_birth: '1111-11-11',
  email: 'aaa@aa.a',
  phone_num: '0812345678',
};

const defaultHotelManagerData = {
  user_type: 'hotel_manager',
  username: 'hotel_manager',
  password: 'hotel_manager',
  first_name: 'hotel_manager',
  last_name: 'hotel_manager',
  gender: 'Male',
  date_of_birth: '1112-12-12',
  email: 'bbb@bb.b',
  phone_num: '0823456789',
};

const defaultHotelManager2Data = {
  user_type: 'hotel_manager',
  username: 'hotel_manager2',
  password: 'hotel_manager2',
  first_name: 'hotel_manager2',
  last_name: 'hotel_manager2',
  gender: 'Male',
  date_of_birth: '1112-12-12',
  email: 'bbb@bb.b',
  phone_num: '0823456789',
};

const defaultHotelData = {
  hotel_id: undefined,
  name: 'name',
  city: 'city',
  address: 'address',
  desc: 'desc',
  imgs: ['img1', 'img2', 'img3', 'img4', 'img5'],
  rooms: [
    {
      name: 'room1',
      num_bed: 1,
      max_person: 1,
      price: 1,
      total_room: 1,
      amenities: [1, 2],
      imgs: ['r1img1'],
    },
    {
      name: 'room2',
      num_bed: 2,
      max_person: 2,
      price: 2,
      total_room: 2,
      amenities: [3, 4],
      imgs: ['r2img1', 'r2img2'],
    },
  ],
};

let travelerToken: string;
let hotelManagerToken: string;
let hotelManager2Token: string;

let hotelId: number;

// Test after user.test

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(defaultTravelerData);
  resTraveler = await request(server).post('/user/login').send(defaultTravelerData);
  travelerToken = resTraveler.body.token;

  let resHotelManager = await request(server).post('/user').send(defaultHotelManagerData);
  resHotelManager = await request(server).post('/user/login').send(defaultHotelManagerData);
  hotelManagerToken = resHotelManager.body.token;

  resHotelManager = await request(server).post('/user').send(defaultHotelManager2Data);
  resHotelManager = await request(server).post('/user/login').send(defaultHotelManager2Data);
  hotelManager2Token = resHotelManager.body.token;

  done();
});

// Only works after POST is working
beforeEach(async (done) => {
  const resHotel = await request(server).post('/hotel')
    .set('Authorization', `Bearer ${hotelManagerToken}`)
    .send(defaultHotelData);
  hotelId = resHotel.body['hotel_id'];
  done();
});

afterEach(async (done) => {
  await util.wipeHotels();
  await util.wipeRequests();
  await server.close();
  done();
});

afterAll(async (done) => {
  await util.wipeUsers();
  done();
});

describe('Get request information', () => {
  it('[GET /request?hotel_id=] should fail (not logged in)', async () => {
    const res = await request(server).get('/request?hotel_id=123').send({
      user_id: 123,
    });
    expect(res.status).toEqual(401);
  });

  it('[GET /request] should fail (not logged in)', async () => {
    const res = await request(server).get('/request').send({
      user_id: 123,
    });
    expect(res.status).toEqual(401);
  });

  it('[GET /request?hotel_id=] should succeed', async () => {
    let res = await request(server).post('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({
        hotel_id: hotelId,
      });
    expect(res.status).toEqual(201);

    res = await request(server).get(`/request?hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(204);
  });

  it('[GET /request] should succeed', async () => {
    let res = await request(server).post('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({
        hotel_id: hotelId,
      });
    expect(res.status).toEqual(201);

    res = await request(server).get('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(200);
    expect(res.body[0].hotel_id).toEqual(hotelId);
  });
});

describe('Create request information', () => {
  it('[POST /request] should fail (not logged in)', async () => {
    const res = await request(server).post('/request').send({
      hotel_id: hotelId,
    });
    expect(res.status).toEqual(401);
  });

  it('[POST /request] should fail (hotel does not exist)', async () => {
    const res = await request(server).post('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({
        hotel_id: 99999999,
      });
    expect(res.status).toEqual(404);
  });

  it('[POST /request] should succeed', async () => {
    const res = await request(server).post('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({
        hotel_id: hotelId,
      });
    expect(res.status).toEqual(201);
  });
});

describe('Delete request information', () => {
  it('[DELETE /request] should fail (not logged in)', async () => {
    const res = await request(server).del('/request?request_id=123');
    expect(res.status).toEqual(401);
  });

  it('[DELETE /request] should fail (request does not exist)', async () => {
    const res = await request(server).del('/request?request_id=99999999')
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(404);
  });

  it('[DELETE /request] should succeed', async () => {
    let res = await request(server).post('/request')
      .set('Authorization', `Bearer ${hotelManagerToken}`)
      .send({
        hotel_id: hotelId,
      });
    expect(res.status).toEqual(201);

    const requestId = res.body.request_id;
    res = await request(server).del(`/request?request_id=${requestId}`)
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.request_id).toEqual(requestId);
  });
});
