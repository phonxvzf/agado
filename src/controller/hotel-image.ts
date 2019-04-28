import koa from 'koa';
import { hotelImageRepo, HotelImage }  from '../model/hotel-image';

const ctrlHotelImage = {
  // After ctrlHotel.getHotel
  getHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];
    const hotelImageInfo = await hotelImageRepo.getHotelImage(hotelId);

    ctx.response.body['imgs'] = hotelImageInfo.map(image => image['img']);

    return next();
  },

  getUserHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
    const hotelImageInfo = await hotelImageRepo.getByHotelIds(hotelIdList);

    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];
      const currentHotelImageInfo =
        hotelImageInfo.filter(hotelImage => hotelImage['hotel_id'] === hotelId);

      each['imgs'] = currentHotelImageInfo.map(image => image['img']);
    }

    return next();
  },

  // After ctrlHotel.createHotel
  updateHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.request.body['hotel_id'];

    await hotelImageRepo.deleteHotelImageByHotelId(hotelId);

    for (let idx = 0; idx < ctx.request.body['imgs'].length; idx += 1) {
      const image = ctx.request.body['imgs'][idx];
      const hotelImageInfo: HotelImage = {
        hotel_id: hotelId,
        img_id: idx,
        img: image,
      };
      await hotelImageRepo.createHotelImage(hotelImageInfo);
    }

    return next();
  },
};

export default ctrlHotelImage;
