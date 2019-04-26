import koaRouter from 'koa-router';
import general from '../controller/general';

const router = new koaRouter();

// Ping
router.get('/ping', general.ping);
router.post('/ping', general.ping);

export default router;
