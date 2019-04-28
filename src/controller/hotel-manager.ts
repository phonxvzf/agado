import koa from 'koa';
import httpStatus from '../common/http-status';
import { codes, ApiError } from '../common/api-error';
import { hotelManagerRepo, HotelManager } from '../model/hotel-manager';
import { validator } from '../common/validator';
import { hotelRepo } from '../model/hotel';

const ctrlHotelManager = {
  checkHotelManagerPermission: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Invalid argument(s)';
    const userId = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    let hotelId: number;

    if (ctx.request.query['hotel_id'] !== undefined) {
      hotelId = validator.validateId(ctx.request.query['hotel_id'], invalidMessage);
    } else if (ctx.request.body['hotel_id'] !== undefined) {
      hotelId = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    } else {
      throw new ApiError('Please specify hotel_id', codes.BAD_VALUE, 400);
    }

    const hotelManagerInfo = await hotelManagerRepo.getHotelManagerByUserId(userId);
    const hotelIdList = hotelManagerInfo.map(management => management['hotel_id']);
    if (!hotelIdList.includes(hotelId)) {
      throw new ApiError('Access denied', codes.UNAUTHORIZED, 401);
    }

    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  createHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Invalid argument(s)';
    let userId: number;
    let hotelId: number;

    if (ctx.request.query['user_id'] !== undefined) {
      userId = validator.validateId(ctx.request.query['user_id'], invalidMessage);
    } else if (ctx.request.body['user_id'] !== undefined) {
      userId = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    } else {
      throw new ApiError('Please specify user_id', codes.BAD_VALUE, 400);
    }

    if (ctx.request.query['hotel_id'] !== undefined) {
      hotelId = validator.validateId(ctx.request.query['hotel_id'], invalidMessage);
    } else if (ctx.request.body['hotel_id'] !== undefined) {
      hotelId = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    } else {
      throw new ApiError('Please specify hotel_id', codes.BAD_VALUE, 400);
    }

    const hotelManagerInfo: HotelManager = {
      user_id: userId,
      hotel_id: hotelId,
    };

    try {
      await hotelManagerRepo.createHotelManager(hotelManagerInfo);
      ctx.response.status = httpStatus.CREATED.code;
    } catch (e) {
      throw new ApiError('Hotel manager already exists', codes.DUPLICATE_HOTEL_MANAGER, 400);
    }

    return next();
  },

  deleteHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id and hotel_id';
    let userId: number;
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], invalidMessage);

    if (ctx.request.query['user_id'] !== undefined) {
      userId = validator.validateId(ctx.request.query['user_id'], invalidMessage);
    } else if (ctx.request.body['user_id'] !== undefined) {
      userId = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    } else {
      throw new ApiError('Please specify user_id', codes.BAD_VALUE, 400);
    }

    const hotelManagerInfo: HotelManager = {
      user_id: userId,
      hotel_id: hotelId,
    };

    try {
      await hotelManagerRepo.deleteHotelManager(hotelManagerInfo);
      ctx.response.status = httpStatus.NO_CONTENT.code;
    } catch (e) {
      throw new ApiError('Hotel manager not found', codes.HOTEL_MANAGER_NOT_FOUND, 404);
    }

    // Delete hotel if no one manages it
    const hotelManagerList = await hotelManagerRepo.getHotelManagerByHotelId(hotelId);
    if (hotelManagerList.length === 0) {
      await hotelRepo.deleteHotel(hotelId);
    }

    return next();
  },
};

export default ctrlHotelManager;
