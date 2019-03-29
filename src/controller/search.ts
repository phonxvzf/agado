import koa from 'koa';
import httpStatus from '../common/http-status';
import search from '../model/search';
import { validator } from '../common/validator';

const ctrlSearch = {
  searchByHotelName: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelName = validator.validateUndefined(
      ctx.request.query['hotel_name'],
      'Please specify hotel_name.',
    );
    const hotelInfo = await search.searchByHotelName(hotelName);
    ctx.response.body = hotelInfo;
    ctx.status = httpStatus.OK.code;
    return next();
  },
};

export default ctrlSearch;
