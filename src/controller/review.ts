import koa from 'koa';
import { validator } from '../common/validator';
import { ApiError, codes } from '../common/api-error';
import Review from '../model/entity/Review';
import review from '../model/review';

const ctrl = {
  getReview: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], 'invalid hotel id');
    const [reviewInst] = await review.getByUserAndHotel(
      ctx.request.body['user_id'],
      hotelId,
    );
    if (reviewInst == null) {
      throw new ApiError('review not found', codes.REVIEW_NOT_FOUND, 404);
    }
    ctx.response.body = reviewInst;
    ctx.response.status = 200;
    return next();
  },

  getReviewOfUser: async (ctx: koa.Context, next: () => Promise<any>) => {
    const userId = validator.validateId(ctx.request.query['user_id'], 'invalid user id');
    ctx.response.body = await review.getByUser(userId);
    ctx.response.status = 200;
    return next();
  },

  getReviewOfHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], 'invalid hotel id');
    ctx.response.body = await review.getByHotel(hotelId);
    ctx.response.status = 200;
    return next();
  },

  createReview: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'specify user_id, hotel_id, title, comment, rating, date';
    validator.validateId(ctx.request.body['user_id'], invalidMessage);
    validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    validator.validateUndefined(ctx.request.body['title'], invalidMessage);
    validator.validateId(ctx.request.body['rating'], invalidMessage);
    validator.validateUndefined(ctx.request.body['date'], invalidMessage);

    const reviewInst: Review = ctx.request.body as Review;
    try {
      const [reviewId] = await review.createReview(reviewInst);
      ctx.response.body = { review_id: reviewId };
      ctx.response.status = 201;
    } catch (e) {
      throw new ApiError('hotel does not exist', codes.OBJECT_NOT_FOUND, 404);
    }
    return next();
  },

  updateReview: async (ctx: koa.Context, next: () => Promise<any>) => {
    const reviewId = validator.validateId(ctx.request.query['review_id'], 'invalid review id');
    const invalidMessage = 'specify user_id, hotel_id, title, comment, rating, date';
    validator.validateId(ctx.request.body['user_id'], invalidMessage);
    validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    validator.validateUndefined(ctx.request.body['title'], invalidMessage);
    validator.validateId(ctx.request.body['rating'], invalidMessage);
    validator.validateUndefined(ctx.request.body['date'], invalidMessage);

    const reviewInst: Review = ctx.request.body as Review;
    try {
      const [updatedId] = await review.updateReview(reviewId, reviewInst);
      if (updatedId == null) {
        throw new ApiError('review does not exist', codes.REVIEW_NOT_FOUND, 404);
      }
      ctx.response.status = 204;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError('hotel does not exist', codes.OBJECT_NOT_FOUND, 404);
    }
    return next();
  },

  deleteReview: async (ctx: koa.Context, next: () => Promise<any>) => {
    const reviewId = validator.validateId(ctx.request.query['review_id'], 'invalid review id');
    const [deletedId] = await review.deleteReview(reviewId);
    ctx.response.body = { review_id: deletedId };
    ctx.response.status = 200;
    if (deletedId == null) {
      throw new ApiError('review does not exist', codes.REVIEW_NOT_FOUND, 404);
    }
    return next();
  },
};

export default ctrl;
