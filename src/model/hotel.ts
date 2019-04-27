import database from './database';
import Hotel from './entity/Hotel';

const hotelRepo = {
  createHotel: async (hotelData: Hotel): Promise<number[]> => {
    return database.insert(hotelData).returning('hotel_id').into('hotel');
  },

  getHotelByHotelId: async (hotelId: number): Promise<Hotel[]> => {
    return database.select('*').from('hotel').where('hotel_id', '=', hotelId);
  },

  getHotelsByHotelId: async (hotelIds: number[]): Promise<Hotel[]> => {
    return database.select('*').from('hotel').whereIn('hotel_id', hotelIds);
  },

  updateHotel: async (hotelData: Hotel): Promise<number[]> => {
    return database('hotel').update(hotelData).where('hotel_id', '=', hotelData['hotel_id']);
  },

  deleteHotel: async (hotelId: number) => {
    return database.del().from('hotel').where('hotel_id', '=', hotelId);
  },
};

export { hotelRepo, Hotel };
