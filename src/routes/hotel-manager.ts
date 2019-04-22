import koaRouter from 'koa-router';
import auth from '../controller/auth';
import hotelManager from '../controller/hotel-manager';

const router = new koaRouter();

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
  hotelManager.updateHotelManager,
);
router.del(
  '/hotelManager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotelManager.deleteHotelManager,
);

export default router;
