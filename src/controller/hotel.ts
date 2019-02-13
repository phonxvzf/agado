import koa from 'koa';
import httpStatus from '../common/http-status';
import config from '../common/config';
import jsonwebtoken from 'jsonwebtoken';
import { codes, ApiError } from '../common/api-error';
import { hotelRepo, Hotel } from '../model/hotel';
import { validator } from '../common/validator';

const ctrlHotel = {
  getHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const id = validator.validateId(ctx.request.query['id'], 'Please specify id.');
    const [hotelInfo] = await hotelRepo.getHotel(id);
    if (hotelInfo == null) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }
    ctx.response.body = Object.assign({ id: id }, hotelInfo);
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

    const hotelData = {
      name: name,
      desc: desc,
      addr: addr,
      prov: prov,
      lat: lat,
      long: long,
      rating: rating
    };

    try {
      const [hotelId] = await hotelRepo.createHotel(hotelData);
      ctx.response.body = { id: hotelId };
      ctx.response.status = httpStatus.CREATED.code;
    } catch (e) {
      throw new ApiError('hotel already exists', codes.DUPLICATE_HOTEL, 400);
    }
    
    return next();
  },

  updateHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'Please specify id, name, (desc,) addr, prov, lat, long, (and rating).';
    const id = validator.validateId(ctx.request.body['id'], invalidMessage);
    const name = validator.validateUndefined(ctx.request.body['name'], invalidMessage);
    const desc = ctx.request.body['desc'];
    const addr = validator.validateUndefined(ctx.request.body['addr'], invalidMessage);
    const prov = validator.validateUndefined(ctx.request.body['prov'], invalidMessage);
    const lat = validator.validateNumber(ctx.request.body['lat'], invalidMessage);
    const long = validator.validateNumber(ctx.request.body['long'], invalidMessage);
    const rating = validator.validateRating(ctx.request.body['rating'], invalidMessage);

    const hotelData = {
      name: name,
      desc: desc,
      addr: addr,
      prov: prov,
      lat: lat,
      long: long,
      rating: rating
    };

    try {
      const [hotelId] = await hotelRepo.updateHotel(id, hotelData);
      ctx.response.body = { id: hotelId };
      ctx.response.status = httpStatus.OK.code;
    } catch (e) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }
    
    return next();
  }, 

  deleteHotel: async(ctx: koa.Context, next: () => Promise<any>) => {
    const id = validator.validateId(ctx.request.body['id'], 'Please specify id.')
    try {
      await hotelRepo.deleteHotel(id);
      ctx.response.status = httpStatus.NO_CONTENT.code;
    } catch (e) {
      throw new ApiError('hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    return next();
  }
};

export default ctrlHotel;