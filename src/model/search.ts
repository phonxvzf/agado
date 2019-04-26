import database from './database';
import Hotel from './entity/Hotel';

const searchRepo = {
  searchByHotelName: async (hotelName?: string): Promise<Hotel[]> => {
    const hname = hotelName ? hotelName : '';
    return database.select('*')
      .from('hotel')
      .where('name', 'LIKE', `%${hname}%`);
  },
};

export default searchRepo;
