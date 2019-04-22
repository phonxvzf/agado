import koa from 'koa';
import httpStatus from '../common/http-status';
import Hotel from '../model/entity/Hotel';
import { codes, ApiError } from '../common/api-error';
import { hotelRepo } from '../model/hotel';
import { validator } from '../common/validator';

const ctrlHotel = {
  getHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const id = validator.validateId(ctx.request.query['hotel_id'], 'Please specify hotel_id.');
    const [hotelInfo] = await hotelRepo.getHotel(id);
    if (hotelInfo == null) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }
    ctx.response.body = hotelInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  createHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify name, (desc,) addr, prov, lat, long, (and rating).';
    const name = validator.validateUndefined(ctx.request.body['name'], invalidMessage);
    const desc = ctx.request.body['desc'];
    const addr = validator.validateUndefined(ctx.request.body['addr'], invalidMessage);
    const prov = validator.validateUndefined(ctx.request.body['prov'], invalidMessage);
    const lat = Number(validator.validateUndefined(ctx.request.body['lat'], invalidMessage));
    const long = Number(validator.validateUndefined(ctx.request.body['long'], invalidMessage));
    const rating = validator.validateRating(ctx.request.body['rating'], invalidMessage);

    const hotelData: Hotel = {
      name,
      desc,
      addr,
      prov,
      lat,
      long,
      rating,
      hotel_id: undefined,
    };

    try {
      const [hotelId] = await hotelRepo.createHotel(hotelData);
      ctx.response.body = { hotel_id: hotelId };
      ctx.response.status = httpStatus.CREATED.code;
    } catch (e) {
      throw new ApiError('hotel already exists', codes.DUPLICATE_HOTEL, 400);
    }

    return next();
  },

  updateHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage =
      'Please specify hotel_id, name, (desc,) addr, prov, lat, long, (and rating).';
    const hotelId = validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    const name = validator.validateUndefined(ctx.request.body['name'], invalidMessage);
    const desc = ctx.request.body['desc'];
    const addr = validator.validateUndefined(ctx.request.body['addr'], invalidMessage);
    const prov = validator.validateUndefined(ctx.request.body['prov'], invalidMessage);
    const lat = validator.validateNumber(ctx.request.body['lat'], invalidMessage);
    const long = validator.validateNumber(ctx.request.body['long'], invalidMessage);
    const rating = validator.validateRating(ctx.request.body['rating'], invalidMessage);

    const hotelData: Hotel = {
      name,
      desc,
      addr,
      prov,
      lat,
      long,
      rating,
      hotel_id: undefined,
    };

    try {
      await hotelRepo.updateHotel(hotelId, hotelData);
      ctx.response.body = { hotel_id: hotelId };
      ctx.response.status = httpStatus.OK.code;
    } catch (e) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    return next();
  },

  deleteHotel: async(ctx: koa.Context, next: () => Promise<any>) => {
    const id = validator.validateId(ctx.request.query['hotel_id'], 'Please specify hotel_id.');
    try {
      await hotelRepo.deleteHotel(id);
      ctx.response.status = httpStatus.NO_CONTENT.code;
    } catch (e) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    return next();
  },
};

export default ctrlHotel;
