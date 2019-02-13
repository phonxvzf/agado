CREATE TYPE room_status AS ENUM ('avail','unavail');
-- CREATE TYPE room_type AS ENUM ('Standard','Deluxe','Suite'); --not used anymore
-- CREATE TYPE hotel_facility AS ENUM ('free_breakfast','swimming pool','fitness center')
CREATE TYPE room_property AS ENUM ('television','warmwater','fridge','safe','jacucci');
CREATE TYPE permission_status AS ENUM ('no','req','pmt'); -- RFC : 'no' , 'req' , 'pmt' ? 

-- ALTER TYPE user_types RENAME ATTRIBUTE hotel TO hotel_manager CASCADE;

create table "hotel"(
id serial,
"name" varchar(255) not null,
"desc" text,
addr text not null,
prov text not null,
lat real not null,
"long" real not null,
-- fac hotel_facility[],
rating decimal default null check(rating>=0 and rating<=5),
primary key(id)
);

create table hotel_manager(
uid int,
hid int,
permitted permission_status,
foreign key (uid) references "user"(id) on update cascade on delete cascade,
foreign key (hid) references "hotel"(id) on update cascade on delete cascade,
primary key (uid,hid)
-- check (select u.user_type from user u where u.uid==uid)=='hotel' --มนจ
);

create table hotel_room(
hid int,
rid serial,
rno varchar(20) not null,
rname varchar(50),
max_cap int default 1,
ex_bed int default 0,
ex_bed_price money default 0::money check (ex_bed_price >=0::money),
reserved boolean default FALSE,
rstatus room_status default 'avail',
-- tag text[],
price money not null check (price>=0::money),
foreign key (hid) references hotel(id) on update cascade on delete cascade,
primary key (hid,rid)
);

create table hotel_room_tag(
hid int,
rid int,
tag room_property,
-- foreign key (hid) references hotel_room(hid) on update cascade on delete cascade,
-- foreign key (rid) references hotel_room(rid) on update cascade on delete cascade,
foreign key (hid, rid) references hotel_room(hid, rid) on update cascade on delete cascade,
primary key (hid,rid,tag)
);