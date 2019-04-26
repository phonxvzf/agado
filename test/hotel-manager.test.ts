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

let travelerId: number;
let hotelManagerId: number;
let hotelManager2Id: number;
let hotelId: number;

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(defaultTravelerData);
  resTraveler = await request(server).post('/user/login').send(defaultTravelerData);
  travelerId = resTraveler.body['user_id'];
  travelerToken = resTraveler.body.token;

  let resHotelManager = await request(server).post('/user').send(defaultHotelManagerData);
  resHotelManager = await request(server).post('/user/login').send(defaultHotelManagerData);
  hotelManagerId = resHotelManager.body['user_id'];
  hotelManagerToken = resHotelManager.body.token;

  resHotelManager = await request(server).post('/user').send(defaultHotelManager2Data);
  resHotelManager = await request(server).post('/user/login').send(defaultHotelManager2Data);
  hotelManager2Id = resHotelManager.body['user_id'];
  hotelManager2Token = resHotelManager.body.token;

  done();
});

beforeEach(async (done) => {
  const resHotel = await request(server).post('/hotel')
    .set('Authorization', `Bearer ${hotelManagerToken}`)
    .send(defaultHotelData);
  hotelId = resHotel.body['hotel_id'];

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

describe('Create hotel manager', () => {
  it('[POST /hotel/manager] should fail (not logged on)', async () => {
    const res = await request(server)
      .post(`/hotel/manager?user_id=${hotelManager2Id}&hotel_id=${hotelId}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[POST /hotel/manager] should fail (traveler access)', async () => {
    const res = await request(server)
      .post(`/hotel/manager?user_id=${hotelManager2Id}&&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[POST /hotel/manager] should succeed (hotel manager access)', async () => {
    const res = await request(server)
      .post(`/hotel/manager?user_id=${hotelManager2Id}&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(httpStatus.CREATED.code);
  });

  it('[POST /hotel/manager] should fail (hotel manager access but no permission)', async () => {
    const res = await request(server)
      .post(`/hotel/manager?user_id=${hotelManager2Id}&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManager2Token}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });
});

describe('Delete hotel manager', () => {
  it('[DEL /hotel/manager] should fail (not logged on)', async () => {
    const res = await request(server)
      .del(`/hotel/manager?user_id=${hotelManagerId}&hotel_id=${hotelId}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[DEL /hotel/manager] should fail (traveler access)', async () => {
    const res = await request(server)
      .del(`/hotel/manager?user_id=${hotelManagerId}&&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });

  it('[DEL /hotel/manager] should succeed (hotel manager access)', async () => {
    let res = await request(server)
      .del(`/hotel/manager?user_id=${hotelManagerId}&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManagerToken}`);
    expect(res.status).toEqual(httpStatus.NO_CONTENT.code);

    res = await request(server).get(`/hotel?${hotelId}`);
    expect(res.status).toEqual(httpStatus.BAD_REQUEST.code);
  });

  it('[DEL /hotel/manager] should fail (hotel manager access but no permission)', async () => {
    const res = await request(server)
      .del(`/hotel/manager?user_id=${hotelManagerId}&hotel_id=${hotelId}`)
      .set('Authorization', `Bearer ${hotelManager2Token}`);
    expect(res.status).toEqual(httpStatus.UNAUTHORIZED.code);
  });
});
