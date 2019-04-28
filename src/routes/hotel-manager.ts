import koaRouter from 'koa-router';
import auth from '../controller/auth';
import hotelManager from '../controller/hotel-manager';

const router = new koaRouter();

router.post(
  '/hotel/manager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotelManager.createHotelManager,
);

router.del(
  '/hotel/manager',
  auth.requireAuth,
  auth.checkHotelManagerType,
  hotelManager.checkHotelManagerPermission,
  hotelManager.deleteHotelManager,
);

export default router;
