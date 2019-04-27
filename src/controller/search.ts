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
    const allHotels: Hotel[] = await search.searchByHotelName('');
    const allHotelIds = allHotels.map(h => h.hotel_id);
    const allReservations = await reservation.getByHotelIds(allHotelIds);

    // Merge with hotel_room
    const hotelRooms = await hotelRoomRepo.getByHotelIds(allHotelIds);
    hotelRooms.sort(compare);

    let iHotelRooms = 0;
    for (let i = 0; i < allHotels.length; i += 1) {
      allHotels[i]['rooms'] = [];
      for (;
        iHotelRooms < hotelRooms.length &&
        allHotels[i].hotel_id === hotelRooms[iHotelRooms].hotel_id;
        iHotelRooms += 1) {
        // delete hotelRooms[iHotelRooms]['hotel_id'];
        // hotelRooms[iHotelRooms]['amenities'] = hotelAmenities
        //   .filter(am => am.room_id === hotelRooms[iHotelRooms].room_id)
        //   .map(am => am.amenity_id);
        // hotelRooms[iHotelRooms]['amenities'].sort();
        // hotelRooms[iHotelRooms]['imgs'] = hotelRoomImages
        //   .filter(img => img.room_id === hotelRooms[iHotelRooms].room_id)
        //   .map(img => img.img);
        // hotelRooms[iHotelRooms]['price'] =
        //   Number(String(hotelRooms[iHotelRooms]['price']).replace(/[,$]/g, ''));
        allHotels[i]['rooms'].push(hotelRooms[iHotelRooms]);
      }
    }

    // Filter by checkin & checkout time
    const availableHotelIds: number[] = [];
    for (const hotel of allHotels) {
      let isAvailable: boolean = false;

      for (const room of hotel['rooms']) {
        const roomId = room['room_id'];
        const currentReservationInfo = allReservations.filter(reserve =>
          reserve['hotel_id'] === hotel['hotel_id'] && reserve['room_id'] === roomId);
        const intersectReservation = currentReservationInfo.filter((reserve) => {
          const reserveCheckIn = new Date(reserve['checkin']);
          const reserveCheckOut = new Date(reserve['checkout']);

          return reserveCheckIn < checkout && reserveCheckOut > checkin;
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

        dateInfo.sort((date1, date2) => date1.getTime() - date2.getTime());
        let maxEngagement = 0;
        let currentEngagement = 0;
        for (const date of dateInfo) {
          const dateString = date.toString();
          currentEngagement += engagementInfo[dateString];
          maxEngagement = (maxEngagement > currentEngagement ? maxEngagement : currentEngagement);
        }

        const availableRoom = room['total_room'] - maxEngagement;
        room['available_room'] = availableRoom;

        if (availableRoom > 0) {
          isAvailable = true;
        }
      }

      if (isAvailable) {
        availableHotelIds.push(hotel['hotel_id']);
      }
    }

    const availableHotels = allHotels.filter(h => availableHotelIds.includes(h.hotel_id));

    // Join stuff
    function compare(a: any, b: any) { return a['hotel_id'] - b['hotel_id']; }

    availableHotels.sort(compare);
    const [
      hotelImgs,
      hotelManagers,
      // hotelRooms,
      hotelReviews,
      hotelAmenities,
      hotelRoomImages,
    ] = await Promise.all([
      hotelImageRepo.getByHotelIds(availableHotelIds),
      hotelManagerRepo.getByHotelIds(availableHotelIds),
      // hotelRoomRepo.getByHotelIds(availableHotelIds),
      review.getByHotelIds(availableHotelIds),
      hotelRoomAmenityRepo.getByHotelIds(availableHotelIds),
      hotelRoomImageRepo.getByHotelIds(availableHotelIds),
    ]);

    hotelImgs.sort(compare);
    hotelManagers.sort(compare);
    // hotelRooms.sort(compare);
    hotelReviews.sort(compare);

    let iHotelImgs = 0;
    let iHotelManagers = 0;
    // let iHotelRooms = 0;
    iHotelRooms = 0;
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
