import koaRouter from 'koa-router';
import auth from '../controller/auth';
import hotelManager from '../controller/hotel-manager';
import hotel from '../controller/hotel';
import hotelImage from '../controller/hotel-image';
import hotelRoom from '../controller/hotel-room';
import hotelRoomAmenity from '../controller/hotel-room-amenity';
import hotelRoomImage from '../controller/hotel-room-image';

const router = new koaRouter();

// Hotel
router.get(
  '/hotel',
  hotel.getHotel,
  hotelImage.getHotelImage,
  hotelRoom.getHotelRoom,
  hotelRoomAmenity.getHotelRoomAmenity,
  hotelRoomImage.getHotelRoomImage,
);

router.get(
  '/hotel/of_user',
  hotel.getUserHotel,
  hotelImage.getUserHotelImage,
  hotelRoom.getUserHotelRoom,
  hotelRoomAmenity.getUserHotelRoomAmenity,
  hotelRoomImage.getUserHotelRoomImage,
);

router.post(
  '/hotel',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotel.createHotel,
  hotelImage.updateHotelImage,
  hotelRoom.updateHotelRoom,
  hotelRoomAmenity.updateHotelRoomAmenity,
  hotelRoomImage.updateHotelRoomImage,
  hotelManager.createHotelManager,
);

router.put(
  '/hotel',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotel.updateHotel,
  hotelImage.updateHotelImage,
  hotelRoom.updateHotelRoom,
  hotelRoomAmenity.updateHotelRoomAmenity,
  hotelRoomImage.updateHotelRoomImage,
);

router.del(
  '/hotel',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotel.deleteHotel,
);

export default router;
