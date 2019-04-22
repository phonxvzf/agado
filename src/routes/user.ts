import koaRouter from 'koa-router';
import auth from '../controller/auth';

const router = new koaRouter();

// User
router.get('/user', auth.getUser);
router.post('/user', auth.createUser);
router.post('/user/login', auth.login);
router.post('/user/logout', auth.requireAuth, auth.logout);
router.put('/user', auth.requireAuth, auth.updateUser);
router.del('/user', auth.requireAuth, auth.deleteUser);

export default router;
