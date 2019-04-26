import database from './database';
import Hotel from './entity/Hotel';

const searchRepo = {
  searchByHotelName: async (hotelName?: string): Promise<Hotel[]> => {
    const hname = hotelName ? hotelName : '';
    return database.select('*')
      .from('hotel')
      .where('name', 'LIKE', `%${hname}%`);
  },

  findByMultipleFields: async (query?: string, minRating: number = -1): Promise<Hotel[]> => {
    const q = query ? query : null;
    return database.select('*')
      .from('hotel')
      .where('name', 'LIKE', `%${q}%`)
      .orWhere('address', 'LIKE', `%${q}%`)
      .orWhere('city', 'LIKE', `%${q}%`)
      .andWhere('rating', '>=', minRating);
  },
};

export default searchRepo;
