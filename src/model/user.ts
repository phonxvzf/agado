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
  getAllUsers: async (): Promise<User[]> => database.select('*').from('user'),

  getUser: async (userId: number): Promise<User[]> => {
    return database.select('*').from('user').where('id', '=', userId);
  },

  getUserByName: async (username: string): Promise<User[]> => {
    return database.select('*').from('user').where('username', '=', username);
  },

  createUser: async (userData: User): Promise<number[]> => {
    return database.insert(userData).returning('id').into('user');
  },

  updateUser: async (id: number, userData: User): Promise<number[]> => {
    return database('user').update(userData).returning('id').where('id', '=', id);
  },

  deleteUser: async (userId: number) => {
    return database.del().from('user').where('id', '=', userId);
  },

  setLoginFlag: async (userId, loggedIn: boolean) => {
    return database('user').update({ logged_in: loggedIn }).where('id', '=', userId);
  },
};

export { userRepo, User };
