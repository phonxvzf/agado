import database from './database';
import HotelImage from './entity/HotelImage';

const hotelImageRepo = {
  createHotelImage: async (hotelImageData: HotelImage): Promise<number[]> => {
    return database.insert(hotelImageData).returning('img_id').into('hotel_img');
  },

  getHotelImage: async (hotelId: number): Promise<HotelImage[]> => {
    return database.select('*').from('hotel_img').where('hotel_id', '=', hotelId);
  },

  deleteHotelImageByHotelId: async (hotelId: number) => {
    return database.del().from('hotel_img').where('hotel_id', '=', hotelId);
  },
};

export { hotelImageRepo, HotelImage };
