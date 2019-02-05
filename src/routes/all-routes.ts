import koaRouter from 'koa-router';
import general from '../controller/general';
import auth from '../controller/auth';

const router = new koaRouter();

// Ping
router.get('/ping', general.ping);
router.post('/ping', general.ping);

// User
router.get('/user', auth.getUser);
router.post('/user', auth.createUser);
router.post('/login', auth.login);
router.put('/user', auth.updateUser);
router.del('/user', auth.deleteUser);

export default router;
