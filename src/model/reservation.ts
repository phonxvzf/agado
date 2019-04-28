import database from './database';
import Reservation from './entity/Reservation';

const reservationRepo = {
  getByUserId: async (userId: number): Promise<Reservation[]> => {
    return database.select('*').from('reservation')
      .where('user_id', '=', userId);
  },

  getByHotelId: async (hotelId: number): Promise<Reservation[]> => {
    return database.select('*').from('reservation')
      .where('hotel_id', '=', hotelId);
  },

  getByHotelIds: async (hotelIds: number[]): Promise<Reservation[]> => {
    return database.select('*').from('reservation')
      .whereIn('hotel_id', hotelIds);
  },

  createReservation: async (reservation: Reservation): Promise<number[]> => {
    return database('reservation').insert(reservation, 'reservation_id');
  },

  deleteReservation: async (reservationId: number): Promise<number[]> => {
    return database('reservation').del('reservation_id')
      .where('reservation_id', '=', reservationId);
  },
};

export default reservationRepo;
