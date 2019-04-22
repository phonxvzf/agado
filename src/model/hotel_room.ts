import database from './database';
import HotelRoom from './entity/HotelRoom';

const hotelRoomRepo = {
  createHotelRoom: async (hotelId: number, hotelRoomData: HotelRoom): Promise<number[]> => {
    const completeHotelRoomData = Object.assign({ hid: hotelId }, hotelRoomData);
    return database.insert(completeHotelRoomData).returning('rid').into('hotel_room');
  },

  getAllHotelRooms: async (hotelId: number): Promise<HotelRoom[]> => {
    return database.select('*').from('hotel_room').where('hid', '=', hotelId);
  },

  getAllReservableHotelRooms: async (hotelId: number): Promise<HotelRoom[]> => {
    return database
      .select('*')
      .from('hotel_room')
      .where(
        'hid', '=', hotelId, 'and',
        'reserved', '=', 'FALSE', 'and',
        'room_status', '=', 'avail',
      );
  },

  getHotelRoomByRoomNumber: async (hotelId: number, roomNumber: string): Promise<HotelRoom[]> => {
    return database.select('*')
      .from('hotel_room')
      .where('hid', '=', hotelId, 'and', 'rno', '=', roomNumber);
  },

  updateHotelRoom: async (
    hotelId: number, roomId: number, hotelRoomData: HotelRoom): Promise<number[]> => {
    const completeHotelRoomData = Object.assign({ hid: hotelId, rid: roomId }, hotelRoomData);
    return database('hotel_room').update(completeHotelRoomData)
      .returning('rid').where(
        'hid', '=', hotelId,
        'and', 'rid', '=', roomId,
      );
  },

  deleteHotelRoom: async (hotelId: number, roomId: number) => {
    return database.del().from('hotel_room').where('hid', '=', hotelId, 'and', 'rid', '=', roomId);
  },
};

export { hotelRoomRepo, HotelRoom };
