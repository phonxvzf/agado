import database from './database';
import Hotel from './entity/Hotel';

const searchRepo = {
  searchByHotelName: async(hotelName: string): Promise<Hotel[]> => {
    return database.select('*').from('hotel').where('name', 'LIKE', `%${hotelName}%`);
  },
};

export default searchRepo;
