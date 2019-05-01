import koa from 'koa';
import httpStatus from '../common/http-status';
import config from '../common/config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import koaJwt from 'koa-jwt';
import { codes, ApiError } from '../common/api-error';
import { userRepo, User } from '../model/user';
import { validator } from '../common/validator';
import { Storage, Bucket } from '@google-cloud/storage';

let gcs = null;
if (process.env.ENABLE_GCS) {
  if (process.env.GCP_PROJECT_ID && process.env.GCS_SERVICE_KEY_PATH && process.env.GCS_BUCKET) {
    gcs = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCS_SERVICE_KEY_PATH,
    });
  }
}

function generateToken(userId: number): string {
  return jsonwebtoken.sign(
    {
      salt: crypto.randomBytes(16).toString('hex'),
    },
    config.JWT_SECRET,
    {
      subject: config.JWT_SUBJECT,
      issuer: config.JWT_ISSUER,
      expiresIn: config.JWT_TTL,
      audience: userId.toString(),
    },
  );
}

async function isRevoked(
  ctx: koa.Context,
  decToken: object,
  token: string): Promise<boolean> {
  const userId = Number.parseInt(decToken['aud'], 10);
  let userToken: string = null;
  try {
    userToken = (await userRepo.getToken(userId))[0].token;
  } catch (e) {
    throw new ApiError('bad token', codes.USER_NOT_FOUND, 404);
  }
  if (token !== userToken) throw new ApiError('token deprecated', codes.DEPRECATED_TOKEN, 401);
  ctx.request.body['user_id'] = userId;
  return false;
}

const jwtMiddleware = koaJwt({
  isRevoked,
  secret: config.JWT_SECRET,
});

const ctrl = {
  requireAuth: async (ctx: koa.Context, next: () => Promise<any>) => {
    try {
      await jwtMiddleware(ctx, next);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (e.originalError != null) {
        if (e.originalError instanceof ApiError) {
          throw e.originalError;
        } else {
          throw new ApiError('access denied', codes.UNAUTHORIZED, 401);
        }
      } else {
        throw new ApiError(e.message, codes.UNAUTHORIZED, 401);
      }
    }
  },

  login: async (ctx: koa.Context, next: () => Promise<any>) => {
    validator.validateUndefined(ctx.request.body['username'], 'invalid username or password');
    validator.validateUndefined(ctx.request.body['password'], 'invalid username or password');
    const userType = validator.validateUserType(
      ctx.request.body['user_type'],
      'invalid user type',
    );

    const [userInfo] = await userRepo.getByNameAndType(ctx.request.body['username'], userType);
    if (userInfo == null) {
      throw new ApiError('access denied', codes.UNAUTHORIZED, 401);
    }

    const passwordCorrect: boolean =
      await bcrypt.compare(ctx.request.body['password'], userInfo.password);
    if (!passwordCorrect) {
      throw new ApiError('incorrect username or password', codes.UNAUTHORIZED, 401);
    }

    const token = generateToken(userInfo.user_id);
    await userRepo.updateToken(userInfo.user_id, token);

    userInfo.token = token;
    delete userInfo.password; // remove password from returning field

    ctx.response.body = userInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  logout: async (ctx: koa.Context, next: () => Promise<any>) => {
    const userId = ctx.request.body['user_id'];
    const userToken = (await userRepo.getToken(userId))[0].token;
    if (userToken == null) {
      throw new ApiError('not logged in', codes.USER_NOT_FOUND, httpStatus.BAD_REQUEST.code);
    }
    await userRepo.updateToken(userId, null);
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },

  getUser: async (ctx: koa.Context, next: () => Promise<any>) => {
    const userId = validator.validateId(ctx.request.query['user_id'], 'specify user_id');
    const [userInfo] = await userRepo.getUser(userId);
    if (userInfo == null) {
      throw new ApiError('user not found', codes.USER_NOT_FOUND, 404);
    }
    delete userInfo['password'];
    delete userInfo['token'];
    ctx.response.body = userInfo;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  checkHotelManagerType: async (ctx: koa.Context, next: () => Promise<any>) => {
    // always check getUser first
    const [userInfo] = await userRepo.getUser(ctx.request.body['user_id']);
    if (userInfo.user_type !== 'hotel_manager') {
      throw new ApiError('access denied (user_type not matched)', codes.UNAUTHORIZED, 401);
    }
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },

  checkTravelerType: async (ctx: koa.Context, next: () => Promise<any>) => {
    const [userInfo] = await userRepo.getUser(ctx.request.body['user_id']);
    if (userInfo.user_type !== 'traveler') {
      throw new ApiError('access denied (user_type not matched)', codes.UNAUTHORIZED, 401);
    }
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },

  createUser: async (ctx: koa.Context, next: () => Promise<any>) => {
    const invalidMessage = 'specify username, password, first_name, last_name, gender, email, '
      + 'phone_num, user_type, date_of_birth';
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

    const userData: User = {
      username,
      email,
      gender,
      password: rawPassword,
      first_name: firstName,
      last_name: lastName,
      phone_num: phoneNum,
      user_type: userType,
      date_of_birth: dateOfBirth,
      user_id: undefined,
      token: undefined,
      img: null,
    };

    try {
      const [userId] = await userRepo.createUser(userData);
      const token = generateToken(userId);
      await userRepo.updateToken(userId, token);

      userData.user_id = userId;
      userData.token = token;

      delete userData.password;

      ctx.response.body = userData;
      ctx.response.status = httpStatus.CREATED.code;
    } catch (e) {
      throw new ApiError('user already exists', codes.DUPLICATE_USER, httpStatus.CONFLICT.code);
    }
    return next();
  },

  updateUser: async (ctx: koa.Context, next: () => Promise<any>) => {
    const rawPassword: string = ctx.request.body['password'];
    const invalidMessage = 'specify username, (password,) first_name, '
      + 'last_name, gender, email, user_type, phone_num, date_of_birth, img';
    const username = validator.validateUndefined(ctx.request.body['username'], invalidMessage);
    const firstName = validator.validateUndefined(ctx.request.body['first_name'], invalidMessage);
    const lastName = validator.validateUndefined(ctx.request.body['last_name'], invalidMessage);
    const gender = validator.validateUndefined(ctx.request.body['gender'], invalidMessage);
    const email = validator.validateUndefined(ctx.request.body['email'], invalidMessage);
    const phoneNum = validator.validateUndefined(ctx.request.body['phone_num'], invalidMessage);
    const userType = validator.validateUndefined(ctx.request.body['user_type'], invalidMessage);
    const dateOfBirth =
      validator.validateUndefined(ctx.request.body['date_of_birth'], invalidMessage);
    let img = validator.validateNullable(ctx.request.body['img'], invalidMessage);

    const image: string = ctx.request.body['img'];
    const isImage = (image != null) && (image.substr(0, 20).search('data:image') >= 0);

    if (gcs) {
      if (isImage) {
        const testDir = (process.env.NODE_ENV === 'production') ? '' : 'test/';
        const blob = Buffer.from(image.substr(image.search(',') + 1), 'base64');
        const ext = image.substr(
          image.search('/') + 1,
          image.search(';') - image.search('/') - 1,
        );
        const fname = `${testDir}${crypto.randomBytes(16).toString('hex')}.${ext}`;
        img = fname;
        const bucket: Bucket = gcs.bucket(process.env.GCS_BUCKET);
        await bucket.file(fname).save(blob, { resumable: false });
      }
    }

    const userData: User = {
      username,
      email,
      gender,
      img,
      password: rawPassword,
      first_name: firstName,
      last_name: lastName,
      phone_num: phoneNum,
      user_type: userType,
      date_of_birth: dateOfBirth,
      user_id: undefined,
      token: undefined,
    };

    // If password is not specified, don't update it.
    if (rawPassword == null) delete userData.password;

    const [userId] = await userRepo.updateUser(ctx.request.body['user_id'], userData);
    userData.user_id = userId;
    delete userData.password;
    delete userData.token;
    ctx.response.body = userData;
    ctx.response.status = httpStatus.OK.code;
    return next();
  },

  deleteUser: async (ctx: koa.Context, next: () => Promise<any>) => {
    await userRepo.deleteUser(ctx.request.body['user_id']);
    ctx.response.status = httpStatus.NO_CONTENT.code;
    return next();
  },
};

export default ctrl;
