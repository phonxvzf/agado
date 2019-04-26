import auth from '../controller/auth';
import review from '../controller/review';
import koaRouter from 'koa-router';

const router = new koaRouter();

router.get('/review', auth.requireAuth, review.getReview);
router.get('/review/of_user', review.getReviewOfUser);
router.get('/review/of_hotel', review.getReviewOfHotel);
router.post('/review', auth.requireAuth, review.createReview);
router.put('/review', auth.requireAuth, review.updateReview);
router.del('/review', auth.requireAuth, review.deleteReview);

export default router;
