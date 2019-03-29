import koaRouter from 'koa-router';
import general from '../controller/general';
import auth from '../controller/auth';
import hotel from '../controller/hotel';
import hotelManager from '../controller/hotel-manager';
import search from '../controller/search';

const router = new koaRouter();

// Ping
router.get('/ping', general.ping);
router.post('/ping', general.ping);

// User
router.get('/user', auth.requireAuth, auth.getUser);
router.post('/user', auth.createUser);
router.post('/login', auth.login);
router.post('/logout', auth.requireAuth, auth.logout);
router.put('/user', auth.requireAuth, auth.updateUser);
router.del('/user', auth.requireAuth, auth.deleteUser);

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

// Hotel Manager
router.get(
  '/hotelManager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.getHotelManager,
);
router.post(
  '/hotelManager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.createHotelManager,
);
router.put(
  '/hotelManager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotelManager.createHotelManager,
);
router.del(
  '/hotelManager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotelManager.deleteHotelManager,
);

// Search
router.get('/search', search.searchByHotelName);

export default router;
