import bcrypt from 'bcrypt';
import database from './database';
import User from './entity/User';

const userRepo = {
  createUser: async (userData: User): Promise<number[]> => {
    const encrypted = Object.assign({}, userData) as User;
    const bcryptSalt = await bcrypt.genSalt(Math.random());
    encrypted.password = await bcrypt.hash(userData.password, bcryptSalt);
    return database.insert(encrypted).returning('user_id').into('user');
  },

  getAllUsers: async (): Promise<User[]> => {
    return database.select('*').from('user');
  },

  getUser: async (userId: number): Promise<User[]> => {
    return database.select('*').from('user').where('user_id', '=', userId);
  },

  getToken: async (userId: number): Promise<any[]> => {
    return database.select('token').from('user').where('user_id', '=', userId);
  },

  getUserByName: async (username: string): Promise<User[]> => {
    return database.select('*').from('user').where('username', '=', username);
  },

  updateUser: async (userId: number, userData: User): Promise<number[]> => {
    const encrypted = Object.assign({}, userData) as User;
    if (encrypted.password) {
      const bcryptSalt = await bcrypt.genSalt(Math.random());
      encrypted.password = await bcrypt.hash(userData.password, bcryptSalt);
    }
    return database('user').update(encrypted).returning('user_id').where('user_id', '=', userId);
  },

  updateToken: async (userId: number, newToken: string) => {
    return database('user').update({ token: newToken }).where('user_id', '=', userId);
  },

  deleteUser: async (userId: number) => {
    return database.del().from('user').where('user_id', '=', userId);
  },
};

export { userRepo, User };
