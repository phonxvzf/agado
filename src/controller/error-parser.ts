import koa from 'koa';
import { ApiError, ErrorResponse } from '../common/api-error';

async function errorParser(ctx: koa.Context, next: Function) {
  try {
    await next();
  } catch (e) {
    if (e instanceof ApiError) {
      ctx.body = e.toErrorResponse();
      ctx.response.status = e.status;
    } else {
      ctx.body = new ErrorResponse(e.message);
      ctx.response.status = 500;
    }
  }
}

export default errorParser;
