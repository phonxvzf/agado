import koaRouter from 'koa-router';
import general from '../controller/general';
import auth from '../controller/auth';

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

export default router;
