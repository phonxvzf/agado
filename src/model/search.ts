import database from './database';
import {Hotel} from './hotel';

const searchRepo = {
    searchByHotelName: async(hotelName: string): Promise<Hotel[]> => {
        return database.select('*').from('hotel').where('name', '=', hotelName);
    }
}

export default searchRepo;