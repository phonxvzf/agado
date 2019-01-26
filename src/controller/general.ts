import koa from 'koa';
import httpStatus from '../common/http-status';
import { codes, ApiError } from '../common/api-error';
import validator from '../common/validator';

const ctrl = {
  ping: async (ctx: koa.Context, next: Function) => {
    ctx.body = 'pong';
    ctx.response.status = httpStatus.OK.code;
    return next();
  },
};

export default ctrl;
