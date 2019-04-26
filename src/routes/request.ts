import auth from '../controller/auth';
import request from '../controller/request';
import koaRouter from 'koa-router';

const router = new koaRouter();

router.get('/request', auth.requireAuth, auth.checkHotelManagerType, request.getRequest);
router.post('/request', auth.requireAuth, auth.checkHotelManagerType, request.createRequest);
router.del('/request', auth.requireAuth, auth.checkHotelManagerType, request.deleteRequest);

export default router;
