import koaCompose from 'koa-compose';
import user from './user';
import general from './general';
import hotel from './hotel';
import hotelManager from './hotel-manager';
import search from './search';
import request from './request';
import reservation from './reservation';
import review from './review';

export default koaCompose([
  user.routes(),
  general.routes(),
  hotel.routes(),
  hotelManager.routes(),
  search.routes(),
  request.routes(),
  reservation.routes(),
  review.routes(),
]);
