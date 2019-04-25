import database from './database';
import HotelRoom from './entity/HotelRoom';

const hotelRoomRepo = {
  createHotelRoom: async (hotelRoomData: HotelRoom): Promise<number[]> => {
    return database.insert(hotelRoomData).returning('room_id').into('hotel_room');
  },

  updateHotelRoom: async (hotelRoomData: HotelRoom) => {
    return database('hotel_room').update(hotelRoomData)
      .where('hotel_id', '=', hotelRoomData.hotel_id)
      .andWhere('room_id', '=', hotelRoomData.room_id);
  },

  getHotelRoomByHotelId: async (hotelId: number): Promise<HotelRoom[]> => {
    return database.select('*').from('hotel_room').where('hotel_id', '=', hotelId);
  },

  deleteHotelRoom: async (hotelId: number, roomId: number) => {
    return database.del().from('hotel_room')
      .where('hotel_id', '=', hotelId)
      .andWhere('room_id', '=', roomId);
  },
};

export { hotelRoomRepo, HotelRoom };
