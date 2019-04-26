import koa from 'koa';
import { ApiError, codes } from '../common/api-error';
import { validator } from '../common/validator';
import search from '../model/search';
import Hotel from '../model/entity/Hotel';
import Reservation from '../model/entity/Reservation';
import reservation from '../model/reservation';
import { hotelImageRepo } from '../model/hotel-image';
import { hotelManagerRepo } from '../model/hotel-manager';
import review from '../model/review';
import { hotelRoomAmenityRepo, HotelRoomAmenity } from '../model/hotel-room-amenity';
import { hotelRoomRepo, HotelRoom } from '../model/hotel-room';

function inBound(x: Date, lowerBound: Date, upperBound: Date) {
  return (x < upperBound && x >= lowerBound);
}

const ctrlSearch = {
  searchHotel: async (ctx: koa.Context, next: () => Promise<any>) => {
    const q = ctx.request.query;
    if (q['checkin'] || q['checkout']) {
      if (q['checkin'] || q['checkout']) {
        throw new ApiError('specify both checkin and checkout', codes.BAD_VALUE, 400);
      }
    }
    const hname = q['hotel_name'];
    let checkin = new Date(0);
    let checkout = new Date(0);
    if (q['checkin']) {
      checkin = new Date(q['checkin']);
      checkout = new Date(q['checkout']);
    }
    const minPrice = q['min_price']
      ? validator.validateNumber(q['min_price'], 'invalid min_price') : -1;
    const maxPrice = q['max_price']
      ? validator.validateNumber(q['max_price'], 'invalid max_price') : Infinity;
    const rating = q['rating']
      ? validator.validateNumber(q['rating'], 'invalid max_price') : -1;
    const amenities = q['amenities']
      ? validator.validateIntegerInArray(q['amenities'], 'invalid amenities') : [];

    // Filter by rating
    let allHotels: Hotel[] = await search.findByMultipleFields(hname, rating);
    const hotelIds: number[] = allHotels.map(h => h.hotel_id);
    const [allRooms, allAmenities, allReservations]
      : [HotelRoom[], HotelRoomAmenity[], Reservation[]]
      = await Promise.all([
        hotelRoomRepo.getByHotelIds(hotelIds),
        hotelRoomAmenityRepo.getByHotelIds(hotelIds),
        reservation.getByHotelIds(hotelIds),
      ]);

    // Filter by amenities
    const hotelAmenities = {};
    allAmenities.forEach((a) => {
      if (hotelAmenities[a.hotel_id] == null) {
        hotelAmenities[a.hotel_id] = [];
      }
      hotelAmenities[a.hotel_id].push(a.amenity_id);
    });
    allHotels = allHotels.filter((h) => {
      const amSet = new Set(hotelAmenities[h.hotel_id]);
      for (let i = 0; i < amenities.length; i += 1) {
        if (!amSet.has(amenities[i])) return false;
      }
      return true;
    });

    // Filter by checkin & checkout time
    const availableRoomIds: number[] = allReservations.filter(
      rsv => (inBound(rsv.checkout, new Date(checkin), new Date(checkout))),
    ).map(rsv => rsv.room_id);

    // Filter by price range
    const availableHotelIds: number[] = allRooms
      .filter(room => availableRoomIds.includes(room.room_id))
      .filter(room => (room.price <= maxPrice && room.price >= minPrice))
      .map(room => room.hotel_id);

    const availableHotels: Hotel[] = allHotels.filter(h => availableHotelIds.includes(h.hotel_id));

    // Join stuff
    function compare(a: any, b: any) { return a['hotel_id'] - b['hotel_id']; }
    const [
      hotelImgs,
      hotelManagers,
      hotelRooms,
      hotelReviews,
    ] = await Promise.all([
      hotelImageRepo.getByHotelIds(availableHotelIds),
      hotelManagerRepo.getByHotelIds(availableHotelIds),
      hotelRoomRepo.getByHotelIds(availableHotelIds),
      review.getByHotelIds(availableHotelIds),
    ]);

    availableHotels.sort(compare);
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
      for (; availableHotels[i].hotel_id === hotelImgs[iHotelImgs].hotel_id; iHotelImgs += 1) {
        availableHotels[i]['imgs'].push(hotelImgs[i]);
      }

      availableHotels[i]['managers'] = [];
      for (;
        availableHotels[i].hotel_id === hotelManagers[iHotelManagers].hotel_id;
        iHotelManagers += 1) {
        availableHotels[i]['managers'].push(hotelManagers[i]);
      }

      availableHotels[i]['rooms'] = [];
      for (; availableHotels[i].hotel_id === hotelRooms[iHotelRooms].hotel_id; iHotelRooms += 1) {
        availableHotels[i]['rooms'].push(hotelRooms[i]);
      }

      availableHotels[i]['reviews'] = [];
      for (;
        availableHotels[i].hotel_id === hotelReviews[iHotelReviews].hotel_id;
        iHotelReviews += 1) {
        availableHotels[i]['reviews'].push(hotelReviews[i]);
      }
    }

    ctx.response.body = availableHotels;
    ctx.response.status = 200;
    return next();
  },
};

export default ctrlSearch;
