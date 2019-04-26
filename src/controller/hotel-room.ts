import koa from 'koa';
import { hotelRoomRepo, HotelRoom }  from '../model/hotel-room';

const ctrlHotelRoom = {
  getHotelRoom: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    const hotelRoomInfo = await hotelRoomRepo.getHotelRoomByHotelId(hotelId);
    hotelRoomInfo.map(room => room['price'] = Number.parseFloat(
      String(room['price']).substring(1)));

    ctx.response.body['rooms'] = hotelRoomInfo;

    return next();
  },

  getUserHotelRoom: async(ctx: koa.Context, next: () => Promise<any>) => {
    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];

      const hotelRoomInfo = await hotelRoomRepo.getHotelRoomByHotelId(hotelId);
      hotelRoomInfo.map(room => room['price'] = Number.parseFloat(
        String(room['price']).substring(1)));

      each['rooms'] = hotelRoomInfo;
    }

    return next();
  },

  updateHotelRoom: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.request.body['hotel_id'];

    const oldHotelRoomInfo = await hotelRoomRepo.getHotelRoomByHotelId(hotelId);
    const oldHotelRoomId = oldHotelRoomInfo.map(room => room['room_id']);

    const newHotelRoomId = [];
    for (let i = 0; i < ctx.request.body['rooms'].length; i += 1) {
      const hotelRoomData = ctx.request.body['rooms'][i];

      const name = hotelRoomData['name'];
      const numBed = hotelRoomData['num_bed'];
      const maxPerson = hotelRoomData['max_person'];
      const price = hotelRoomData['price'];
      const totalRoom = hotelRoomData['total_room'];

      const hotelRoomInfo: HotelRoom = {
        name,
        price,
        hotel_id: hotelId,
        room_id: undefined,
        num_bed: numBed,
        max_person: maxPerson,
        total_room: totalRoom,
      };

      let roomId: number;
      if (hotelRoomData.hasOwnProperty('room_id')) {
        roomId = hotelRoomData['room_id'];
        hotelRoomInfo['room_id'] = roomId;
        await hotelRoomRepo.updateHotelRoom(hotelRoomInfo);
      } else {
        [roomId] = await hotelRoomRepo.createHotelRoom(hotelRoomInfo);
        hotelRoomData['room_id'] = roomId;
      }

      newHotelRoomId.push(roomId);
    }

    for (const roomId of oldHotelRoomId) {
      if (!(newHotelRoomId.includes(roomId))) {
        await hotelRoomRepo.deleteHotelRoom(hotelId, roomId);
      }
    }

    ctx.response.body = ctx.request.body;

    return next();
  },
};

export default ctrlHotelRoom;
