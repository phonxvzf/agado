import koa from 'koa';
import { validator } from '../common/validator';
import { ApiError, codes } from '../common/api-error';
import request from '../model/request';
import { hotelManagerRepo } from '../model/hotel-manager';

const ctrl = {
  getRequest: async (ctx: koa.Context, next: () => Promise<any>) => {
    let hotelId = null;
    if (ctx.request.query['hotel_id'] != null) {
      hotelId = validator.validateId(ctx.request.query['hotel_id'], 'invalid hotel_id');
      const [requestInst] = await request.getRequest(ctx.request.body['user_id'], hotelId);
      if (requestInst == null) {
        throw new ApiError('request not found', codes.REQUEST_NOT_FOUND, 404);
      }
      ctx.response.status = 204;
    } else {
      const hotelsManaged = await hotelManagerRepo.getHotelManagerByUserId(
        ctx.request.body['user_id'],
      );
      const hotelIds: number[] = hotelsManaged.map(h => h.hotel_id);
      const requestInsts = await request.getRequestByHotelIds(hotelIds);
      ctx.response.body = requestInsts;
      ctx.response.status = 200;
    }
    return next();
  },

  createRequest: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.body['hotel_id'], 'invalid hotel_id');
    try {
      const [requestId] = await request.createRequest(ctx.request.body['user_id'], hotelId);
      ctx.response.body = { request_id: requestId };
      ctx.response.status = 201;
    } catch (e) {
      throw new ApiError('hotel does not exist', codes.OBJECT_NOT_FOUND, 404);
    }
    return next();
  },

  deleteRequest: async (ctx: koa.Context, next: () => Promise<any>) => {
    const requestId = validator.validateId(ctx.request.query['request_id'], 'invalid request_id');
    const [deletedId] = await request.deleteRequestById(requestId);
    if (deletedId == null) {
      throw new ApiError('request not found', codes.REQUEST_NOT_FOUND, 404);
    }
    ctx.response.body = { request_id: deletedId };
    ctx.response.status = 200;
    return next();
  },
};

export default ctrl;
