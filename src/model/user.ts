import bcrypt from 'bcrypt';
import database from './database';

interface User {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone_num: string;
  user_type: string;
  date_of_birth: string | number;
}

const userRepo = {
  createUser: async (userData: User): Promise<number[]> => {
    const encrypted = Object.assign({}, userData) as User;
    const bcryptSalt = await bcrypt.genSalt(Math.random());
    encrypted.password = await bcrypt.hash(userData.password, bcryptSalt);
    return database.insert(encrypted).returning('id').into('user');
  },

  getAllUsers: async (): Promise<User[]> => {
    return database.select('*').from('user');
  },

  getUser: async (userId: number): Promise<User[]> => {
    return database.select('*').from('user').where('id', '=', userId);
  },

  getToken: async (userId: number): Promise<any[]> => {
    return database.select('token').from('user').where('id', '=', userId);
  },

  getUserByName: async (username: string): Promise<User[]> => {
    return database.select('*').from('user').where('username', '=', username);
  },

  updateUser: async (id: number, userData: User): Promise<number[]> => {
    const encrypted = Object.assign({}, userData) as User;
    const bcryptSalt = await bcrypt.genSalt(Math.random());
    encrypted.password = await bcrypt.hash(userData.password, bcryptSalt);
    return database('user').update(encrypted).returning('id').where('id', '=', id);
  },

  updateToken: async (userId, newToken: string) => {
    return database('user').update({ token: newToken }).where('id', '=', userId);
  },

  deleteUser: async (userId: number) => {
    return database.del().from('user').where('id', '=', userId);
  },
};

export { userRepo, User };
