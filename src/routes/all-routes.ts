import koaCompose from 'koa-compose';
import user from './user';
import general from './general';
import hotel from './hotel';
import hotelManager from './hotel-manager';
import search from './search';

export default koaCompose([
  user.routes(),
  general.routes(),
  hotel.routes(),
  hotelManager.routes(),
  search.routes(),
]);
