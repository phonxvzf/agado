interface User {
  user_id: number;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone_num: string;
  user_type: string;
  token: string;
  date_of_birth: string | number;
  img: string;
}

export default User;
