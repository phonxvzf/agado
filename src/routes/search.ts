import koaRouter from 'koa-router';
import search from '../controller/search';

const router = new koaRouter();

// Search
router.get('/search', search.searchHotel);

export default router;
