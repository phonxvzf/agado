import koa from 'koa';
import httpStatus from '../common/http-status';
import { codes, ApiError } from '../common/api-error';
import { hotelRepo, Hotel } from '../model/hotel';
import { validator } from '../common/validator';
import { hotelManagerRepo } from '../model/hotel-manager';
import review from '../model/review';
import { userRepo } from '../model/user';

const reviewRepo = review;

const ctrlHotel = {
  getHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], 'Please specify hotel_id');
    const [hotelInfo] = await hotelRepo.getHotelByHotelId(hotelId);

    if (hotelInfo == null) {
      throw new ApiError('Hotel not found', codes.HOTEL_NOT_FOUND, 404);
    }

    const userInfo = await userRepo.getAllUsers();
    userInfo.map((user) => {
      delete user['token'];
      delete user['password'];
    });

    const hotelManagerTable = await hotelManagerRepo.getHotelManagerByHotelId(hotelId);
    const hotelManagerList = hotelManagerTable.map(hotelManager => hotelManager['user_id']);

    const hotelManagerInfo = [];
    for (const userId of hotelManagerList) {
      hotelManagerInfo.push(userInfo.filter(user => user['user_id'] === userId)[0]);
    }

    const reviewInfo = await reviewRepo.getByHotel(hotelId);
    for (const review of reviewInfo) {
      review['user'] = userInfo.filter(user => user['user_id'] === review['user_id'])[0];
    }

    ctx.response.body = hotelInfo;
    ctx.response.body['managers'] = hotelManagerList;
    ctx.response.body['managers_info'] = hotelManagerInfo;
    ctx.response.body['reviews'] = reviewInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  getUserHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const userId = validator.validateId(ctx.request.query['user_id'], 'Please specify user_id');

    const userInfo = await userRepo.getAllUsers();
    userInfo.map((user) => {
      delete user['password'];
      delete user['token'];
    });

    const [currentUserInfo] = userInfo.filter(user => user['user_id'] === userId);

    if (currentUserInfo == null) {
      throw new ApiError('User does not exist', codes.USER_NOT_FOUND, httpStatus.NOT_FOUND.code);
    } else if (currentUserInfo['user_type'] !== 'hotel_manager') {
      throw new ApiError('Not a hotel manager', codes.BAD_VALUE, httpStatus.BAD_REQUEST.code);
    }

    const hotelManagerInfo = await hotelManagerRepo.getAllHotelManager();

    const userHotelManagerList = hotelManagerInfo.filter(each => each['user_id'] === userId);
    const hotelIdList = userHotelManagerList.map(manager => manager['hotel_id']);

    const reviewInfo = await reviewRepo.getByHotelIds(hotelIdList);

    ctx.response.body = await hotelRepo.getHotelsByHotelId(hotelIdList);

    for (const hotel of ctx.response.body) {
      const hotelHotelManagerInfo = hotelManagerInfo.filter(
        hotelManager => hotelManager['hotel_id'] === hotel['hotel_id']);
      hotel['managers'] = hotelHotelManagerInfo.map(hotelManager => hotelManager['user_id']);

      hotel['managers_info'] = [];
      for (const userId of hotel['managers']) {
        hotel['managers_info'].push(userInfo.filter(user => user['user_id'] === userId)[0]);
      }

      hotel['reviews'] = reviewInfo.filter(review => review['hotel_id'] === hotel['hotel_id']);
      for (const review of hotel['reviews']) {
        review['user'] = userInfo.filter(user => user['user_id'] === review['user_id'])[0];
      }
    }

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
