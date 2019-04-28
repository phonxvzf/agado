import database from './database';
import HotelRoomImage from './entity/HotelRoomImage';

const hotelRoomImageRepo = {
  createHotelRoomImage: async (hotelRoomImageData: HotelRoomImage): Promise<number[]> => {
    return database.insert(hotelRoomImageData).returning('img_id').into('hotel_room_img');
  },

  getByHotelIds: async (hotelIds: number[]): Promise<HotelRoomImage[]> => {
    return database.select('*').from('hotel_room_img')
      .whereIn('hotel_id', hotelIds);
  },

  getHotelRoomImage: async (hotelId: number, roomId: number): Promise<HotelRoomImage[]> => {
    return database.select('*').from('hotel_room_img')
      .where('hotel_id', '=', hotelId)
      .andWhere('room_id', '=', roomId);
  },

  deleteHotelRoomImageByHotelId: async (hotelId: number) => {
    return database.del().from('hotel_room_img').where('hotel_id', '=', hotelId);
  },
};

export { hotelRoomImageRepo, HotelRoomImage };
