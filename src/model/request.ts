import database from './database';
import Request from './entity/Request';

const requestRepo = {
  getRequest: async (userId: number, hotelId: number): Promise<Request[]> => {
    return database.select('request_id').from('request')
      .where('user_id', '=', userId).andWhere('hotel_id', '=', hotelId);
  },

  getRequestByUserId: async (userId: number): Promise<Request[]> => {
    return database.select('*').from('request').where('user_id', '=', userId);
  },

  getRequestByHotelIds: async (hotelIds: number[]): Promise<Request[]> => {
    return database.select('*').from('request').whereIn('hotel_id', hotelIds);
  },

  createRequest: async (userId: number, hotelId: number): Promise<number[]> => {
    return database('request').insert({ user_id: userId, hotel_id: hotelId })
      .returning('request_id');
  },

  deleteRequestById: async (requestId: number): Promise<number[]> => {
    return database('request').del('request_id').where('request_id', '=', requestId);
  },
};

export default requestRepo;
