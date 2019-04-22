import database from './database';
import Hotel from './entity/Hotel';

const hotelRepo = {
  createHotel: async (hotelData: Hotel): Promise<number[]> => {
    return database.insert(hotelData).returning('hotel_id').into('hotel');
  },

  getAllHotels: async (): Promise<Hotel[]> => {
    return database.select('*').from('hotel');
  },

  getHotel: async (hotelId: number): Promise<Hotel[]> => {
    return database.select('*').from('hotel').where('hotel_id', '=', hotelId);
  },

  getHotelByName: async (hotelName: string): Promise<Hotel[]> => {
    return database.select('*').from('hotel').where('name', '=', hotelName);
  },

  updateHotel: async (hotelId: number, hotelData: Hotel): Promise<number[]> => {
    return database('hotel').update(hotelData).where('hotel_id', '=', hotelId);
  },

  deleteHotel: async (hotelId: number) => {
    return database.del().from('hotel').where('hotel_id', '=', hotelId);
  },
};

export { hotelRepo, Hotel };
