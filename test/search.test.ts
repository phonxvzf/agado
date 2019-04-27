import supertest from 'supertest';
import index from '../src/index';
import util from './util';
import httpStatus from '../src/common/http-status';
import database from '../src/model/database';

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

const hotelData2 = {
  hotel_id: undefined,
  name: 'hotel2',
  city: 'city2',
  address: 'address2',
  desc: 'desc2',
  imgs: ['img1', 'img2', 'img3', 'img4', 'img5'],
  rooms: [
    {
      name: 'h2_room1',
      num_bed: 1,
      max_person: 1,
      price: 1,
      total_room: 1,
      amenities: [1, 2],
      imgs: ['r1img1'],
    },
    {
      name: 'h2_room2',
      num_bed: 2,
      max_person: 2,
      price: 2,
      total_room: 2,
      amenities: [3, 4],
      imgs: ['r2img1', 'r2img2'],
    },
  ],
};

const hotelData3 = {
  hotel_id: undefined,
  name: 'hotel3',
  city: 'city3',
  address: 'address3',
  desc: 'desc3',
  imgs: ['img1', 'img2', 'img3', 'img4', 'img5'],
  rooms: [
    {
      name: 'h3_room1',
      num_bed: 1,
      max_person: 1,
      price: 1,
      total_room: 1,
      amenities: [1, 2],
      imgs: ['r1img1'],
    },
    {
      name: 'h3_room2',
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
let travelerId: number;
let hotelManagerToken: string;
let hotelManager2Token: string;

let hotelIds: number[] = [];
const roomIds = [[], [], []];

// Test after user.test

beforeAll(async (done) => {
  let resTraveler = await request(server).post('/user').send(defaultTravelerData);
  resTraveler = await request(server).post('/user/login').send(defaultTravelerData);
  travelerToken = resTraveler.body.token;
  travelerId = resTraveler.body.user_id;

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
  hotelIds = [];
  let resHotel = await request(server).post('/hotel')
    .set('Authorization', `Bearer ${hotelManagerToken}`)
    .send(defaultHotelData);
  hotelIds.push(resHotel.body['hotel_id']);

  resHotel = await request(server).post('/hotel')
    .set('Authorization', `Bearer ${hotelManagerToken}`)
    .send(hotelData2);
  hotelIds.push(resHotel.body['hotel_id']);

  resHotel = await request(server).post('/hotel')
    .set('Authorization', `Bearer ${hotelManagerToken}`)
    .send(hotelData3);
  hotelIds.push(resHotel.body['hotel_id']);

  done();
});

afterEach(async (done) => {
  await util.wipeReservation();
  await util.wipeHotels();
  await server.close();
  done();
});

afterAll(async (done) => {
  await util.wipeUsers();
  done();
});

describe('Search for hotels', () => {
  it('[GET /search] without queries should return all hotels', async () => {
    const res = await request(server).get('/search');
    expect(res.status).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].hotel_id).toEqual(hotelIds[0]);
    expect(res.body[1].hotel_id).toEqual(hotelIds[1]);
    expect(res.body[2].hotel_id).toEqual(hotelIds[2]);
  });

  it('[GET /search] should filter correctly', async () => {
    let res = await request(server).get('/search');
    expect(res.status).toEqual(200);

    roomIds[0][0] = res.body[0].rooms[0].room_id;
    roomIds[0][1] = res.body[0].rooms[1].room_id;

    roomIds[1][0] = res.body[1].rooms[0].room_id;
    roomIds[1][1] = res.body[1].rooms[1].room_id;

    roomIds[2][0] = res.body[2].rooms[0].room_id;
    roomIds[2][1] = res.body[2].rooms[1].room_id;

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[0],
        room_id: roomIds[0][0],
        num: 1,
        checkin: (new Date(0)).toISOString(),
        checkout: (new Date(10)).toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[0],
        room_id: roomIds[0][1],
        num: 1,
        checkin: (new Date(11)).toISOString(),
        checkout: (new Date(20)).toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[1],
        room_id: roomIds[1][0],
        num: 1,
        checkin: (new Date(30)).toISOString(),
        checkout: (new Date(40)).toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[1],
        room_id: roomIds[1][1],
        num: 1,
        checkin: (new Date(50)).toISOString(),
        checkout: (new Date(60)).toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[2],
        room_id: roomIds[2][0],
        num: 1,
        checkin: (new Date(70)).toISOString(),
        checkout: (new Date(100)).toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelIds[2],
        room_id: roomIds[2][1],
        num: 1,
        checkin: (new Date(120)).toISOString(),
        checkout: (new Date(130)).toISOString(),
      });
    expect(res.status).toEqual(201);

    let checkin = (new Date(60)).toISOString();
    let checkout = (new Date(300)).toISOString();
    res = await request(server).get(`/search?checkin=${checkin}&checkout=${checkout}`);
    expect(res.status).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].hotel_id).toEqual(hotelIds[0]);
    expect(res.body[1].hotel_id).toEqual(hotelIds[1]);

    checkin = (new Date(0)).toISOString();
    checkout = (new Date(300)).toISOString();
    res = await request(server).get(`/search?checkin=${checkin}&checkout=${checkout}`);
    expect(res.status).toEqual(200);
    expect(res.body.length).toEqual(3);
  });
});
