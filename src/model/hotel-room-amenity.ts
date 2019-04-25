import database from './database';
import HotelRoomAmenity from './entity/HotelRoomAmenity';

const hotelRoomAmenityRepo = {
  createHotelRoomAmenity: async (hotelRoomAmenityData: HotelRoomAmenity) => {
    return database.insert(hotelRoomAmenityData).into('hotel_room_amenity');
  },

  getHotelRoomAmenity: async (hotelId: number, roomId: number): Promise<HotelRoomAmenity[]> => {
    return database.select('*').from('hotel_room_amenity')
      .where('hotel_id', '=', hotelId)
      .andWhere('room_id', '=', roomId);
  },

  deleteHotelRoomAmenityByHotelId: async (hotelId: number) => {
    return database.del().from('hotel_room_amenity').where('hotel_id', '=', hotelId);
  },
};

export { hotelRoomAmenityRepo, HotelRoomAmenity };
