import database from './database';
import HotelManager from './entity/HotelManager';

const hotelManagerRepo = {
  createHotelManager: async (hotelManagerData: HotelManager) => {
    return database.insert(hotelManagerData).into('hotel_manager');
  },

  getHotelManagerByUserId: async (userId: number): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager').where('user_id', '=', userId);
  },

  getHotelManagerByHotelId: async (hotelId: number): Promise<HotelManager[]> => {
    return database.select('*').from('hotel_manager').where('hotel_id', '=', hotelId);
  },

  deleteHotelManager: async (hotelManagerData: HotelManager) => {
    return database.del()
      .from('hotel_manager')
      .where('user_id', '=', hotelManagerData.user_id)
      .andWhere('hotel_id', '=', hotelManagerData.hotel_id);
  },
};

export { hotelManagerRepo, HotelManager };
