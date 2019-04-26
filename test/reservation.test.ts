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
let roomId: number;

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
  roomId = resHotel.body['rooms'][0]['room_id'];
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

describe('Get reservation information', () => {
  it('[GET /reservation] should fail (not logged in)', async () => {
    const res = await request(server).get('/reservation?hotel_id=123').send({
      user_id: 123,
    });
    expect(res.status).toEqual(401);
  });

  it('[GET /reservation/of_hotel] should fail (not logged in)', async () => {
    const res = await request(server).get('/reservation/of_hotel?hotel_id=123').send({
      user_id: 123,
    });
    expect(res.status).toEqual(401);
  });

  it('[GET /reservation] should succeed', async () => {
    const time = (new Date());
    let res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelId,
        room_id: roomId,
        num: 1,
        checkin: time.toISOString(),
        checkout: time.toISOString(),
      });
    expect(res.status).toEqual(201);

    res = await request(server).get('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(200);
    expect(res.body[0].hotel_id).toEqual(hotelId);
    expect(new Date(res.body[0].checkin)).toEqual(time);
  });
});

describe('Create reservation information', () => {
  it('[POST /reservation] should fail (not logged in)', async () => {
    const res = await request(server).post('/reservation').send({});
    expect(res.status).toEqual(401);
  });

  it('[POST /reservation] should fail (hotel not found)', async () => {
    const res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: 9999999,
        room_id: roomId,
        num: 1,
        checkin: (new Date()).toISOString(),
        checkout: (new Date()).toISOString(),
      });
    expect(res.status).toEqual(404);
  });

  it('[POST /reservation] should succeed', async () => {
    const res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelId,
        room_id: roomId,
        num: 1,
        checkin: (new Date()).toISOString(),
        checkout: (new Date()).toISOString(),
      });
    expect(res.status).toEqual(201);
  });
});

describe('Delete reservation information', () => {
  it('[DELETE /reservation] should fail (not logged in)', async () => {
    const res = await request(server).del('/reservation?reservation_id=123');
    expect(res.status).toEqual(401);
  });

  it('[DELETE /reservation] should fail (reservation not found)', async () => {
    const res = await request(server).del('/reservation?reservation_id=99999999')
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(404);
  });

  it('[DELETE /reservation] should succeed', async () => {
    let res = await request(server).post('/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        hotel_id: hotelId,
        room_id: roomId,
        num: 1,
        checkin: (new Date()).toISOString(),
        checkout: (new Date()).toISOString(),
      });
    expect(res.status).toEqual(201);
    const reservationId = res.body.reservation_id;

    res = await request(server).del(`/reservation?reservation_id=${reservationId}`)
      .set('Authorization', `Bearer ${travelerToken}`);
    expect(res.status).toEqual(200);
  });
});
