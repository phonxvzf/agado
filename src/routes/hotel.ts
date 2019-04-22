import koaRouter from 'koa-router';
import auth from '../controller/auth';
import hotelManager from '../controller/hotel-manager';
import hotel from '../controller/hotel';

const router = new koaRouter();

// Hotel
router.get('/hotel', auth.requireAuth, hotel.getHotel);
router.post('/hotel', auth.requireAuth, auth.checkHotelManagerType, hotel.createHotel);
router.put(
  '/hotel',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotel.updateHotel,
);
router.del(
  '/hotel',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotel.deleteHotel,
);

export default router;
