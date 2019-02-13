CREATE TYPE genders AS ENUM ('Male','Female','Not specified','Prefer not to say');
CREATE TYPE user_types AS ENUM ('traveler', 'hotel_manager', 'admin');

create table "user" (
  id serial,
  email varchar(255),
  username varchar(255),
  password varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  phone_num varchar(20),
  user_type user_types default 'traveler',
  gender genders default 'Not specified',
  logged_in boolean default TRUE,
  date_of_birth date,
  primary key(id)
);
