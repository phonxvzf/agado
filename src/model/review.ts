import database from './database';
import Review from './entity/Review';

const reviewRepo = {
  getByUserAndHotel: async (userId: number, hotelId: number): Promise<Review[]> => {
    return database('review').select('*')
      .where('user_id', '=', userId)
      .andWhere('hotel_id', '=', hotelId);
  },

  getByUser: async (userId: number): Promise<Review[]> => {
    return database('review').select('*')
      .where('user_id', '=', userId);
  },

  getByHotel: async (hotelId: number): Promise<Review[]> => {
    return database('review').select('*')
      .where('hotel_id', '=', hotelId);
  },

  getByHotelIds: async (hotelIds: number[]): Promise<Review[]> => {
    return database('review').select('*').whereIn('hotel_id', hotelIds);
  },

  createReview: async (review: Review): Promise<number[]> => {
    return database('review').insert(review, 'review_id');
  },

  updateReview: async (reviewId: number, newReview: Review): Promise<number[]> => {
    return database('review').update(newReview, 'review_id').where('review_id', '=', reviewId);
  },

  deleteReview: async (reviewId: number): Promise<number[]> => {
    return database('review').del('review_id').where('review_id', '=', reviewId);
  },
};

export default reviewRepo;
