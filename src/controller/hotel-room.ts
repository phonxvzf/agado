import koa from 'koa';
import { hotelRoomRepo, HotelRoom }  from '../model/hotel-room';
import reservation from '../model/reservation';

const reservationRepo = reservation;

const ctrlHotelRoom = {
  getHotelRoom: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    const hotelRoomInfo = await hotelRoomRepo.getHotelRoomByHotelId(hotelId);
    hotelRoomInfo.map(room => room['price'] = Number(String(room['price']).replace(/[,$]/g, '')));

    ctx.response.body['rooms'] = hotelRoomInfo;

    if (ctx.request.query['checkin'] !== undefined
        && ctx.request.query['checkout'] !== undefined) {
      const checkIn = new Date(ctx.request.query['checkin']);
      const checkOut = new Date(ctx.request.query['checkout']);

      let reservationInfo = await reservationRepo.getByHotelId(hotelId);
      reservationInfo = reservationInfo.filter(reserve => reserve['hotel_id'] === hotelId);

      for (const room of ctx.response.body['rooms']) {
        const roomId = room['room_id'];
        const currentReservationInfo = reservationInfo.filter(reserve =>
          reserve['room_id'] === roomId);
        const intersectReservation = currentReservationInfo.filter((reserve) => {
          const reserveCheckIn = new Date(reserve['checkin']);
          const reserveCheckOut = new Date(reserve['checkout']);

          return reserveCheckIn < checkOut && reserveCheckOut > checkIn;
        });

        const engagementInfo = {};
        const dateInfo: Date[] = [];

        for (const reserve of intersectReservation) {
          if (engagementInfo[reserve['checkin'].toString()] === undefined) {
            engagementInfo[reserve['checkin'].toString()] = 0;
            dateInfo.push(reserve['checkin']);
          }
          if (engagementInfo[reserve['checkout'].toString()] === undefined) {
            engagementInfo[reserve['checkout'].toString()] = 0;
            dateInfo.push(reserve['checkout']);
          }

          engagementInfo[reserve['checkin'].toString()] += reserve['num'];
          engagementInfo[reserve['checkout'].toString()] -= reserve['num'];
        }

        dateInfo.sort();
        let maxEngagement = 0;
        let currentEngagement = 0;
        for (const date of dateInfo) {
          const dateString = date.toString();
          currentEngagement += engagementInfo[dateString];
          maxEngagement = (maxEngagement > currentEngagement ? maxEngagement : currentEngagement);
        }

        const availableRoom = room['total_room'] - maxEngagement;
        room['available_room'] = availableRoom;
      }
    }

    return next();
  },

  getUserHotelRoom: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
    const hotelRoomInfo = await hotelRoomRepo.getByHotelIds(hotelIdList);
    hotelRoomInfo.map(room => room['price'] = Number.parseFloat(
      String(room['price']).substring(1)));

    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];

      each['rooms'] = hotelRoomInfo.filter(room => room['hotel_id'] === hotelId);
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
