import { validGender, validUserType } from '../src/common/validator';
import database from '../src/model/database';
import { userRepo, User } from '../src/model/user';
import { hotelRepo, Hotel } from '../src/model/hotel';
import { hotelRoomRepo, HotelRoom } from '../src/model/hotel-room';
import { hotelManagerRepo, HotelManager } from '../src/model/hotel-manager';
import request from '../src/model/request';
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

  wipeRequests: async () => {
    return database.del().from('request');
  },

  wipeReservation: async () => {
    return database.del().from('reservation');
  },

  wipeReviews: async () => {
    return database.del().from('review');
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
      user_id: undefined,
      token: undefined,
    };
  },

  generateUser: async (): Promise<number[]> => {
    const userData = util.generateUserData();
    return userRepo.createUser(userData);
  },

  addUser: async (userData: User): Promise<number[]> => {
    return userRepo.createUser(userData);
  },

  addHotel: async (hotelData: Hotel): Promise<number[]> => {
    return hotelRepo.createHotel(hotelData);
  },

  addHotelManager: async (hotelManagerData: HotelManager) => {
    return hotelManagerRepo.createHotelManager(hotelManagerData);
  },
};

export default util;
