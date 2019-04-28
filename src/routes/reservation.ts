import auth from '../controller/auth';
import reservation from '../controller/reservation';
import koaRouter from 'koa-router';

const router = new koaRouter();

router.get('/reservation', auth.requireAuth, reservation.getReservation);
router.get('/reservation/of_hotel', auth.requireAuth, reservation.getReservationOfHotel);
router.post('/reservation', auth.requireAuth, reservation.createReservation);
router.del('/reservation', auth.requireAuth, reservation.deleteReservation);

export default router;
