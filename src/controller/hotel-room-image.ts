import koa from 'koa';
import { hotelRoomImageRepo, HotelRoomImage }  from '../model/hotel-room-image';

const ctrlHotelRoomImage = {
  // After ctrlHotelRoom.getHotelRoom
  getHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    for (let i = 0; i < ctx.response.body['rooms'].length; i += 1) {
      const roomId = ctx.response.body['rooms'][i]['room_id'];
      const hotelRoomImageInfo =
        await hotelRoomImageRepo.getHotelRoomImage(hotelId, roomId);
      ctx.response.body['rooms'][i]['imgs'] = hotelRoomImageInfo.map(image => image['img']);
    }

    return next();
  },

  getUserHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
    const hotelRoomImageInfo = await hotelRoomImageRepo.getByHotelIds(hotelIdList);

    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];

      for (let i = 0; i < each['rooms'].length; i += 1) {
        const roomId = each['rooms'][i]['room_id'];
        const currentHotelRoomImageInfo = hotelRoomImageInfo.filter(image =>
          image['hotel_id'] === hotelId && image['room_id'] === roomId);
        each['rooms'][i]['imgs'] = currentHotelRoomImageInfo.map(image => image['img']);
      }
    }

    return next();
  },

  // After ctrlHotelRoom.createHotelRoom
  updateHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    await hotelRoomImageRepo.deleteHotelRoomImageByHotelId(hotelId);

    for (let i = 0; i < ctx.request.body['rooms'].length; i += 1) {
      const hotelRoomInfo = ctx.request.body['rooms'][i];
      const roomId = hotelRoomInfo['room_id'];

      for (let idx = 0; idx < hotelRoomInfo['imgs'].length; idx += 1) {
        const image = hotelRoomInfo['imgs'][idx];
        const hotelRoomImageInfo: HotelRoomImage = {
          hotel_id: hotelId,
          room_id: roomId,
          img_id: idx,
          img: image,
        };

        await hotelRoomImageRepo.createHotelRoomImage(hotelRoomImageInfo);
      }
    }

    return next();
  },
};

export default ctrlHotelRoomImage;
