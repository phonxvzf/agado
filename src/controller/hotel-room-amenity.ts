import koa from 'koa';
import { hotelRoomAmenityRepo, HotelRoomAmenity }  from '../model/hotel-room-amenity';

const ctrlHotelRoomAmenity = {
  // After ctrlHotelRoom.getHotelRoom
  getHotelRoomAmenity: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    for (let i = 0; i < ctx.response.body['rooms'].length; i += 1) {
      const roomId = ctx.response.body['rooms'][i]['room_id'];
      const hotelRoomAmenityInfo =
        await hotelRoomAmenityRepo.getHotelRoomAmenity(hotelId, roomId);
      ctx.response.body['rooms'][i]['amenities'] =
        hotelRoomAmenityInfo.map(amenity => amenity['amenity_id']);
    }

    return next();
  },

  getUserHotelRoomAmenity: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
    const hotelRoomAmenityInfo = await hotelRoomAmenityRepo.getByHotelIds(hotelIdList);
    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];

      for (let i = 0; i < each['rooms'].length; i += 1) {
        const roomId = each['rooms'][i]['room_id'];
        const currentHotelRoomAmenity = hotelRoomAmenityInfo.filter(amenity =>
          amenity['hotel_id'] === hotelId && amenity['room_id'] === roomId);
        each['rooms'][i]['amenities'] =
        currentHotelRoomAmenity.map(amenity => amenity['amenity_id']);
      }
    }

    return next();
  },

  // After ctrlHotelRoom.createHotelRoom
  updateHotelRoomAmenity: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    await hotelRoomAmenityRepo.deleteHotelRoomAmenityByHotelId(hotelId);

    for (let i = 0; i < ctx.request.body['rooms'].length; i += 1) {
      const hotelRoomInfo = ctx.request.body['rooms'][i];
      const roomId = hotelRoomInfo['room_id'];

      for (let j = 0; j < hotelRoomInfo['amenities'].length; j += 1) {
        const amenityId = hotelRoomInfo['amenities'][j];
        const hotelRoomAmenityInfo: HotelRoomAmenity = {
          hotel_id: hotelId,
          room_id: roomId,
          amenity_id: amenityId,
        };

        await hotelRoomAmenityRepo.createHotelRoomAmenity(hotelRoomAmenityInfo);
      }
    }

    return next();
  },
};

export default ctrlHotelRoomAmenity;
