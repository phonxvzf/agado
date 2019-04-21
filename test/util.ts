import { validGender, validUserType } from '../src/common/validator';
import database from '../src/model/database';
import { userRepo, User } from '../src/model/user';
import { hotelRepo, Hotel } from '../src/model/hotel';
import { hotelRoomRepo, HotelRoom } from '../src/model/hotel_room';
import { hotelManagerRepo, HotelManager } from '../src/model/hotel_manager';
import crypto from 'crypto';

const validGenderArray = Array.from(validGender);
const validUserTypeArray = Array.from(validUserType);

const util = {
  wipeUsers: async () => {
    return database.del().from('user');
  },

  wipeHotels: async () => {
    return database.del().from('hotel');
  },

  wipeHotelRooms: async () => {
    return database.del().from('hotel_room');
  },

  wipeHotelManagers: async () => {
    return database.del().from('hotel_manager');
  },

  generateUserData: (): User => {
    return {
      username: crypto.randomBytes(10).toString('base64'),
      password: crypto.randomBytes(10).toString('base64'),
      first_name: crypto.randomBytes(10).toString('base64'),
      last_name: crypto.randomBytes(10).toString('base64'),
      gender: validGenderArray[Math.floor(Math.random() * validGenderArray.length)],
      user_type: validUserTypeArray[Math.floor(Math.random() * validUserTypeArray.length)],
      email: crypto.randomBytes(10).toString('base64'),
      phone_num: crypto.randomBytes(10).toString('base64'),
      date_of_birth:
        (new Date(Math.floor(1e12 + Math.random() * 1e12))).toISOString().substr(0, 10),
      img: crypto.randomBytes(10).toString('base64'),
    };
  },

  generateHotelData: (): Hotel => {
    return {
      name: crypto.randomBytes(10).toString('base64'),
      desc: crypto.randomBytes(10).toString('base64'),
      addr: crypto.randomBytes(10).toString('base64'),
      prov: crypto.randomBytes(10).toString('base64'),
      lat: Math.random() * 180 - 90,
      long: Math.random() * 360 - 180,
      rating: Math.random() * 5,
    };
  },

  generateHotelRoomData: (): HotelRoom => {
    return {
      rno: crypto.randomBytes(10).toString('base64'),
      rname: crypto.randomBytes(10).toString('base64'),
      max_cap: Math.floor(Math.random() * 1000) + 1,
      ex_bed: Math.floor(Math.random() * 1000) + 1,
      ex_bed_price: Math.floor(Math.random() * 1e12),
      reserved: Math.round(Math.random()) === 1 ? true : false,
      rstatus: Math.round(Math.random()) === 1 ? 'avail' : 'unavail',
      price: Math.floor(Math.random() * 1e12),
    };
  },

  generateHotelManagerData: (userId: number, hotelId: number): HotelManager => {
    const permitMode = Math.floor(Math.random() * 3) + 1;
    const permitted = (permitMode === 0 ? 'pmt' : (permitMode === 1 ? 'no' : 'req'));
    return {
      permitted,
      uid: userId,
      hid: hotelId,
    };
  },

  generateUser: async (): Promise<number[]> => {
    const userData = util.generateUserData();
    return userRepo.createUser(userData);
  },

  generateHotel: async (): Promise<number[]> => {
    const hotelData = util.generateHotelData();
    return hotelRepo.createHotel(hotelData);
  },

  generateHotelRoom: async (): Promise<number[]> => {
    const hotelId = 1;
    const hotelRoomData = util.generateHotelRoomData();
    return hotelRoomRepo.createHotelRoom(hotelId, hotelRoomData);
  },

  generateHotelManager: async () => {
    const userId = 1;
    const hotelId = 1;
    const hotelManagerData = util.generateHotelManagerData(userId, hotelId);
    return hotelManagerRepo.createHotelManager(hotelManagerData);
  },

  addUser: async (userData: User): Promise<number[]> => {
    return userRepo.createUser(userData);
  },

  addHotel: async (hotelData: Hotel): Promise<number[]> => {
    return hotelRepo.createHotel(hotelData);
  },

  addHotelRoom: async (hotelId: number, hotelRoomData: HotelRoom): Promise<number[]> => {
    return hotelRoomRepo.createHotelRoom(hotelId, hotelRoomData);
  },

  addHotelManager: async (hotelManagerData: HotelManager) => {
    return hotelManagerRepo.createHotelManager(hotelManagerData);
  },
};

export default util;
