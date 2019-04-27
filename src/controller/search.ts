import koa from 'koa';
import { ApiError, codes } from '../common/api-error';
import search from '../model/search';
import User from '../model/entity/User';
import Hotel from '../model/entity/Hotel';
import reservation from '../model/reservation';
import { hotelImageRepo } from '../model/hotel-image';
import { hotelManagerRepo } from '../model/hotel-manager';
import review from '../model/review';
import { hotelRoomAmenityRepo } from '../model/hotel-room-amenity';
import { hotelRoomRepo } from '../model/hotel-room';
import { hotelRoomImageRepo } from '../model/hotel-room-image';

function intersect(left: Date, right: Date, lowerBound: Date, upperBound: Date) {
  let l = left;
  let r = right;
  if (left > right) {
    r = left;
    l = right;
  }
  if (r > upperBound && l < lowerBound) return true;
  if (l >= lowerBound && r < upperBound) return true;
  if (l >= lowerBound && l < upperBound) return true;
  if (r >= lowerBound && r < upperBound) return true;
  return false;
}

const ctrlSearch = {
  searchHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const q = ctx.request.query;
    if (q['checkin'] || q['checkout']) {
      if (!q['checkin'] || !q['checkout']) {
        throw new ApiError('specify both checkin and checkout', codes.BAD_VALUE, 400);
      }
    }
    let checkin = new Date(0);
    let checkout = new Date(0);
    if (q['checkin']) {
      checkin = new Date(q['checkin']);
      checkout = new Date(q['checkout']);
    }

    // Get all hotels
    let availableHotels: Hotel[] = await search.searchByHotelName('');
    const availableHotelIds = availableHotels.map(h => h.hotel_id);
    const allReservations = await reservation.getByHotelIds(availableHotelIds);

    // Filter by checkin & checkout time
    const reservedHotelIds: Set<number> = new Set(allReservations.filter(
      rsv => intersect(checkin, checkout, new Date(rsv.checkin), new Date(rsv.checkout)),
    ).map(rsv => rsv.hotel_id));

    availableHotels = availableHotels.filter(h => !reservedHotelIds.has(h.hotel_id));

    // Join stuff
    function compare(a: any, b: any) { return a['hotel_id'] - b['hotel_id']; }

    availableHotels.sort(compare);
    const [
      hotelImgs,
      hotelManagers,
      hotelRooms,
      hotelReviews,
      hotelAmenities,
      hotelRoomImages,
    ] = await Promise.all([
      hotelImageRepo.getByHotelIds(availableHotelIds),
      hotelManagerRepo.getByHotelIds(availableHotelIds),
      hotelRoomRepo.getByHotelIds(availableHotelIds),
      review.getByHotelIds(availableHotelIds),
      hotelRoomAmenityRepo.getByHotelIds(availableHotelIds),
      hotelRoomImageRepo.getByHotelIds(availableHotelIds),
    ]);

    hotelImgs.sort(compare);
    hotelManagers.sort(compare);
    hotelRooms.sort(compare);
    hotelReviews.sort(compare);

    let iHotelImgs = 0;
    let iHotelManagers = 0;
    let iHotelRooms = 0;
    let iHotelReviews = 0;
    for (let i = 0; i < availableHotels.length; i += 1) {
      availableHotels[i]['imgs'] = [];
      for (;
        iHotelImgs < hotelImgs.length &&
        availableHotels[i].hotel_id === hotelImgs[iHotelImgs].hotel_id;
        iHotelImgs += 1) {
        availableHotels[i]['imgs'].push(hotelImgs[iHotelImgs]['img']);
      }

      availableHotels[i]['managers_info'] = [];
      for (;
        iHotelManagers < hotelManagers.length &&
        availableHotels[i].hotel_id === hotelManagers[iHotelManagers].hotel_id;
        iHotelManagers += 1) {
        delete hotelManagers[iHotelManagers]['token'];
        delete hotelManagers[iHotelManagers]['password'];
        delete hotelManagers[iHotelManagers]['user_type'];
        availableHotels[i]['managers_info'].push(hotelManagers[iHotelManagers]);
      }

      availableHotels[i]['managers'] = availableHotels[i]['managers_info']
        .map((m: User) => m.user_id);

      availableHotels[i]['rooms'] = [];
      for (;
        iHotelRooms < hotelRooms.length &&
        availableHotels[i].hotel_id === hotelRooms[iHotelRooms].hotel_id;
        iHotelRooms += 1) {
        delete hotelRooms[iHotelRooms]['hotel_id'];
        hotelRooms[iHotelRooms]['amenities'] = hotelAmenities
          .filter(am => am.room_id === hotelRooms[iHotelRooms].room_id)
          .map(am => am.amenity_id);
        hotelRooms[iHotelRooms]['amenities'].sort();
        hotelRooms[iHotelRooms]['imgs'] = hotelRoomImages
          .filter(img => img.room_id === hotelRooms[iHotelRooms].room_id)
          .map(img => img.img);
        hotelRooms[iHotelRooms]['price'] =
          Number(String(hotelRooms[iHotelRooms]['price']).replace(/[,$]/g, ''));
        availableHotels[i]['rooms'].push(hotelRooms[iHotelRooms]);
      }

      availableHotels[i]['reviews'] = [];
      for (;
        iHotelReviews < hotelReviews.length &&
        availableHotels[i].hotel_id === hotelReviews[iHotelReviews].hotel_id;
        iHotelReviews += 1) {
        delete hotelReviews[iHotelReviews]['hotel_id'];
        availableHotels[i]['reviews'].push(hotelReviews[iHotelReviews]);
      }
    }

    ctx.response.body = availableHotels;
    ctx.response.status = 200;
    return next();
  },
};

export default ctrlSearch;
