import koa from 'koa';
import httpStatus from '../common/http-status';
import bcrypt from 'bcrypt';
import { codes, ApiError } from '../common/api-error';
import { userRepo, User } from '../model/user';
import { validator } from '../common/validator';

const ctrl = {
  // TODO: authenticate middleware, if logged_in == false >> unauthorized
  login: async (ctx: koa.Context, next: Function) => {
    validator.validateUndefined(ctx.request.body['username'], 'invalid username or password');
    validator.validateUndefined(ctx.request.body['password'], 'invalid username or password');

    const [userInfo] = await userRepo.getUserByName(ctx.request.body['username']);
    if (userInfo == null) {
      throw new ApiError('user not found', codes.USER_NOT_FOUND, 404);
    }

    const passwordCorrect: boolean =
      await bcrypt.compare(ctx.request.body['password'], userInfo.password);
    if (!passwordCorrect) {
      throw new ApiError('incorrect username or password', codes.UNAUTHORIZED, 401);
    }

    await userRepo.setLoginFlag(userInfo['id'], true);
    ctx.response.body = userInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  /* TODO: add route for logout, don't forget authenticate middleware
  logout: async (ctx: koa.Context, next: Function) => {
    const userId = validator.validateId(ctx.request.body['id'], 'invalid user id');
    const [userInfo] = await userRepo.getUser(userId);
    if (userInfo == null) {
      throw new ApiError('user not found', codes.USER_NOT_FOUND, 404);
    }
    await userRepo.setLoginFlag(userId, false);
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },
   */

  getUser: async (ctx: koa.Context, next: Function) => {
    if (ctx.query['id'] == null) {
      const [userList] = await userRepo.getAllUsers();
      ctx.response.body = userList;
      ctx.response.status = httpStatus.OK.code;
      return next();
    }

    validator.validateId(ctx.query['id'], 'invalid user id');

    const [userInfo] = await userRepo.getUser(ctx.query['id']);
    if (userInfo == null) {
      throw new ApiError('user not found', codes.USER_NOT_FOUND, 404);
    }
    delete userInfo['password'];
    ctx.response.body = userInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  createUser: async (ctx: koa.Context, next: Function) => {
    const invalidMessage =
      'specify username, password, first_name, last_name, gender, email, phone_nume, date_of_birth';
    const username = validator.validateUndefined(ctx.request.body['username'], invalidMessage);
    const rawPassword = validator.validateUndefined(ctx.request.body['password'], invalidMessage);
    const firstName = validator.validateUndefined(ctx.request.body['first_name'], invalidMessage);
    const lastName = validator.validateUndefined(ctx.request.body['last_name'], invalidMessage);
    const gender = validator.validateUndefined(ctx.request.body['gender'], invalidMessage);
    const email = validator.validateUndefined(ctx.request.body['email'], invalidMessage);
    const phoneNum = validator.validateUndefined(ctx.request.body['phone_num'], invalidMessage);
    const userType = validator.validateUndefined(ctx.request.body['user_type'], invalidMessage);
    const dateOfBirth =
      validator.validateUndefined(ctx.request.body['date_of_birth'], invalidMessage);

    const bcryptSalt = await bcrypt.genSalt(Math.random());
    const password = await bcrypt.hash(rawPassword, bcryptSalt);

    const userData: User = {
      username,
      password,
      email,
      gender,
      first_name: firstName,
      last_name: lastName,
      phone_num: phoneNum,
      user_type: userType,
      date_of_birth: dateOfBirth,
    };

    const [userId] = await userRepo.createUser(userData);
    ctx.response.body = { id: userId };
    ctx.response.status = httpStatus.CREATED.code;
    return next();
  },

  updateUser: async (ctx: koa.Context, next: Function) => {
    const invalidMessage = `specify id, username, password, first_name, last_name,
gender, email, phone_nume, date_of_birth`;
    const id = validator.validateId(ctx.request.body['id'], invalidMessage);
    const username = validator.validateUndefined(ctx.request.body['username'], invalidMessage);
    const rawPassword = validator.validateUndefined(ctx.request.body['password'], invalidMessage);
    const firstName = validator.validateUndefined(ctx.request.body['first_name'], invalidMessage);
    const lastName = validator.validateUndefined(ctx.request.body['last_name'], invalidMessage);
    const gender = validator.validateUndefined(ctx.request.body['gender'], invalidMessage);
    const email = validator.validateUndefined(ctx.request.body['email'], invalidMessage);
    const phoneNum = validator.validateUndefined(ctx.request.body['phone_num'], invalidMessage);
    const userType = validator.validateUndefined(ctx.request.body['user_type'], invalidMessage);
    const dateOfBirth =
      validator.validateUndefined(ctx.request.body['date_of_birth'], invalidMessage);

    const bcryptSalt = await bcrypt.genSalt(Math.random());
    const password = await bcrypt.hash(rawPassword, bcryptSalt);

    const userData: User = {
      username,
      password,
      email,
      gender,
      first_name: firstName,
      last_name: lastName,
      phone_num: phoneNum,
      user_type: userType,
      date_of_birth: dateOfBirth,
    };
    const [userId] = await userRepo.updateUser(id, userData);
    ctx.response.body = { id: userId };
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  deleteUser: async (ctx: koa.Context, next: Function) => {
    const userId = validator.validateId(ctx.request.body['id']);
    await userRepo.deleteUser(userId);
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },
};

export default ctrl;
