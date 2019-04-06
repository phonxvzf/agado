import koa from 'koa';
import httpStatus from '../common/http-status';
import { codes, ApiError } from '../common/api-error';
import { hotelManagerRepo } from '../model/hotel_manager';
import { validator } from '../common/validator';

const ctrlHotelManager = {
  getHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id and/or hotel_id.';
    const uid = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    const hid = validator.validateId(ctx.request.query['hotel_id'], invalidMessage);

    try {
      const hotelManagerInfo = await hotelManagerRepo.getHotelManager(uid, hid);
      ctx.response.body = hotelManagerInfo;
      ctx.response.status = httpStatus.OK.code;
    } catch (e) {
      throw new ApiError('hotel manager not found', codes.HOTEL_MANAGER_NOT_FOUND, 404);
    }

    return next();
  },

  checkHotelManagerPermission: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id and/or hotel_id.';
    const uid = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    const hid = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);

    try {
      const hotelManagerInfo = await hotelManagerRepo.getHotelManager(uid, hid);
      if (hotelManagerInfo[0].permitted !== 'pmt') {
        throw new ApiError('access denied', codes.UNAUTHORIZED, 401); // check--throw inside try?
      }
    } catch (e) {
      throw new ApiError('hotel manager not found', codes.HOTEL_MANAGER_NOT_FOUND, 404);
    }

    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  createHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id, hotel_id, and permission_type.';
    const uid = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    const hid = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    const permitted = validator.validatePermitted(
      ctx.request.body['permission_type'],
      invalidMessage,
    );

    const hotelManagerInfo = {
      uid,
      hid,
      permitted,
    };

    try {
      await hotelManagerRepo.createHotelManager(hotelManagerInfo);
      ctx.response.status = httpStatus.CREATED.code;
    } catch (e) {
      throw new ApiError('hotel manager already exists', codes.DUPLICATE_HOTEL_MANAGER, 400);
    }

    return next();
  },

  updateHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id, hotel_id, and permission_type.';
    const uid = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    const hid = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    const permitted = validator.validatePermitted(
      ctx.request.body['permission_type'],
      invalidMessage,
    );

    const hotelManagerInfo = {
      uid,
      hid,
      permitted,
    };

    try {
      await hotelManagerRepo.updateHotelManager(hotelManagerInfo);
      ctx.response.status = httpStatus.OK.code;
    } catch (e) {
      throw new ApiError('hotel manager not found', codes.HOTEL_MANAGER_NOT_FOUND, 404);
    }

    return next();
  },

  deleteHotelManager: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify user_id, hotel_id, and permission_type.';
    const uid = validator.validateId(ctx.request.body['user_id'], invalidMessage);
    const hid = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);

    try {
      await hotelManagerRepo.deleteHotelManager(uid, hid);
      ctx.response.status = httpStatus.NO_CONTENT.code;
    } catch (e) {
      throw new ApiError('hotel manager not found', codes.HOTEL_MANAGER_NOT_FOUND, 404);
    }

    return next();
  },
};

export default ctrlHotelManager;
