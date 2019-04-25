import koa from 'koa';
import httpStatus from '../common/http-status';
import { codes, ApiError } from '../common/api-error';
import { hotelRepo, Hotel } from '../model/hotel';
import { validator } from '../common/validator';

const ctrlHotel = {
  getHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], 'Please specify hotel_id');
    const [hotelInfo] = await hotelRepo.getHotelByHotelId(hotelId);

    if (hotelInfo == null) {
      throw new ApiError('Hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    ctx.response.body = hotelInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  createHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Invalid argument(s)';
    const name = validator.validateUndefined(ctx.request.body['name'], invalidMessage);
    const city = validator.validateUndefined(ctx.request.body['city'], invalidMessage);
    const address = validator.validateUndefined(ctx.request.body['address'], invalidMessage);
    const desc = ctx.request.body['desc'] === undefined ? '' : ctx.request.body['desc'];

    const hotelInfo: Hotel = {
      name,
      city,
      address,
      desc,
      hotel_id: undefined,
    };

    const [hotelId] = await hotelRepo.createHotel(hotelInfo);

    ctx.request.body['hotel_id'] = hotelId;
    ctx.response.status = httpStatus.CREATED.code;

    return next();
  },

  updateHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Invalid argument(s)';
    const hotelId = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    const name = validator.validateUndefined(ctx.request.body['name'], invalidMessage);
    const city = validator.validateUndefined(ctx.request.body['city'], invalidMessage);
    const address = validator.validateUndefined(ctx.request.body['address'], invalidMessage);
    const desc = ctx.request.body['desc'];

    const hotelData: Hotel = {
      name,
      city,
      address,
      desc,
      hotel_id: hotelId,
    };

    try {
      await hotelRepo.updateHotel(hotelData);
      ctx.response.status = httpStatus.OK.code;
    } catch (e) {
      throw new ApiError('Hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    return next();
  },

  deleteHotel: async(ctx: koa.Context, next: () => Promise<any>) => {
    const id = validator.validateId(ctx.request.query['hotel_id'], 'Please specify hotel_id');
    try {
      await hotelRepo.deleteHotel(id);
      ctx.response.status = httpStatus.NO_CONTENT.code;
    } catch (e) {
      throw new ApiError('Hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    return next();
  },
};

export default ctrlHotel;
