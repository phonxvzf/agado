import database from './database';

interface Hotel {
  name: string;
  desc: string;
  addr: string;
  prov: string;
  lat: number;
  long: number;
  rating: number;
}

const hotelRepo = {
  createHotel: async (hotelData: Hotel): Promise<number[]> => {
    return database.insert(hotelData).returning('id').into('hotel');
  },

  getAllHotels: async (): Promise<Hotel[]> => {
    return database.select('*').from('hotel');
  },

  getHotel: async (hotelId: number): Promise<Hotel[]> => {
    return database.select('*').from('hotel').where('id', '=', hotelId);
  },

  getHotelByName: async (hotelName: string): Promise<Hotel[]> => {
    return database.select('*').from('');
  },

  updateHotel: async (hotelId: number, hotelData: Hotel): Promise<number[]> => {
    return database('hotel').update(hotelData);
  },

  deleteHotel: async (hotelId: number) => {
    return database.del().from('hotel').where('id', '=', hotelId);
  },
};

export { hotelRepo, Hotel };
