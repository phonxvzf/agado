import supertest from 'supertest';
import index from '../src/index';
import database from '../src/model/database';
import util from './util';
import { Hotel } from '../src/model/hotel';

const request = supertest;
const server = index;
const db = database;

const defaultHotelData = util.generateHotelData();

beforeAll(async (done) => {
  const hotel1 = Object.assign({}, defaultHotelData);
  hotel1.name = "ABC";
  await util.addHotel(hotel1);

  const hotel2 = Object.assign({}, defaultHotelData);
  hotel2.name = "DEF";
  await util.addHotel(hotel2);

  const hotel3 = Object.assign({}, defaultHotelData);
  hotel3.name = "ABCDEF";
  await util.addHotel(hotel3);

  done();
});

afterEach(async (done) => {
  server.close();
  done();
});

afterAll(async (done) => {
  await util.wipeHotels();
  done();
})

describe('Search by name', () => {
  it('[GET /search] should succeed', async () => {
    const res = await request(server).get('/search?hotel_name=ABC');
    expect(res.body[0].name).toEqual('ABC');
    expect(res.body[1].name).toEqual('ABCDEF');
  });
});