import database from './database';

interface HotelManager {
  uid: number;
  hid: number;
  permitted: string;
}

const hotelManagerRepo = {
  createHotelManager: async (hotelManagerData: HotelManager) => {
    database.insert(hotelManagerData).into('hotel_manager');
  },

  getAllHotelManagers: async (): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager');
  },

  getAllUnpermittedHotelManagerByHotelId: async (): Promise<any> => {    // check + fix
    return database.select('*').from('hotel_manager').groupBy('hid').where('permitted', '=', 'req');
  },

  getAllHotelManagersByHotelId: async (hotelId: number): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager').where('hid', '=', hotelId);
  },

  getAllHotelManagersByUserId: async (userId: number): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager').where('uid', '=', userId);
  },

  getHotelManager: async (userId: number, hotelId: number): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager').where('uid', '=', userId, 'and', 'hid', '=', hotelId);
  },

  updateHotelManager: async (hotelManagerData: HotelManager) => {
    return database('hotel_manager').update(hotelManagerData);
  },

  deleteHotelManager: async (userId: number, hotelId: number) => {
    return database.del().from('hotel_manager').where('uid', '=', userId, 'and', 'hid', '=', hotelId);
  }
};

export { hotelManagerRepo, HotelManager };