import koa from 'koa';
import { codes, ApiError } from '../common/api-error';
import { validator } from '../common/validator';
import Reservation from '../model/entity/Reservation';
import reservation from '../model/reservation';

const ctrl = {
  getReservation: async (ctx: koa.Context, next: () => Promise<any>) => {
    ctx.response.body = await reservation.getByUserId(ctx.request.body['user_id']);
    ctx.response.status = 200;
    return next();
  },

  getReservationOfHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = validator.validateId(ctx.request.query['hotel_id'], 'invalid hotel id');
    ctx.response.body = await reservation.getByHotelId(hotelId);
    ctx.response.status = 200;
    return next();
  },

  createReservation: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'specify user_id, hotel_id, room_id, num, checkin, checkout';
    validator.validateId(ctx.request.body['user_id'], invalidMessage);
    validator.validateId(ctx.request.body['hotel_id'], invalidMessage);
    validator.validateId(ctx.request.body['room_id'], invalidMessage);
    validator.validateId(ctx.request.body['num'], invalidMessage);
    validator.validateUndefined(ctx.request.body['checkin'], invalidMessage);
    validator.validateUndefined(ctx.request.body['checkout'], invalidMessage);

    const reservationInst: Reservation = ctx.request.body as Reservation;
    try {
      const [reservationId] = await reservation.createReservation(reservationInst);
      ctx.response.body = { reservation_id: reservationId };
      ctx.response.status = 201;
    } catch (e) {
      throw new ApiError('hotel or room does not exist', codes.OBJECT_NOT_FOUND, 404);
    }
    return next();
  },

  deleteReservation: async (ctx: koa.Context, next: () => Promise<any>) => {
    const reservationId = validator.validateId(
      ctx.request.query['reservation_id'],
      'invalid reservation id',
    );
    const [deletedId] = await reservation.deleteReservation(reservationId);
    ctx.response.body = { reservation_id: deletedId };
    ctx.response.status = 200;
    if (deletedId == null) {
      throw new ApiError('reservation not found', codes.RESERVATION_NOT_FOUND, 404);
    }
    return next();
  },
};

export default ctrl;
