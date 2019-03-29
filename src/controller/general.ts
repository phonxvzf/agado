import koa from 'koa';
import httpStatus from '../common/http-status';

const ctrl = {
  ping: async (ctx: koa.Context, next: () => Promise<any>) => {
    ctx.body = 'pong';
    ctx.response.status = httpStatus.OK.code;
    return next();
  },
};

export default ctrl;
