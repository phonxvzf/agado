import { validGender, validUserType } from '../src/common/validator';
import database from '../src/model/database';
import { userRepo, User } from '../src/model/user';
import crypto from 'crypto';

const validGenderArray = Array.from(validGender);
const validUserTypeArray = Array.from(validUserType);

const util = {
  wipeUsers: async () => {
    return database.del().from('user');
  },

  generateUserData: (): User => {
    return {
      username: crypto.randomBytes(10).toString('base64'),
      password: crypto.randomBytes(10).toString('base64'),
      first_name: crypto.randomBytes(10).toString('base64'),
      last_name: crypto.randomBytes(10).toString('base64'),
      gender: validGenderArray[Math.floor(Math.random() * validGenderArray.length)],
      user_type: validUserTypeArray[Math.floor(Math.random() * validUserTypeArray.length)],
      email: crypto.randomBytes(10).toString('base64'),
      phone_num: crypto.randomBytes(10).toString('base64'),
      date_of_birth:
      (new Date(Math.floor(1e12 + Math.random() * 1e12))).toISOString().substr(0, 10),
    };
  },

  generateUser: async (): Promise<number[]> => {
    const userData = util.generateUserData();
    return userRepo.createUser(userData);
  },
};

export default util;
