interface Reservation {
  reservation_id?: number;
  user_id: number;
  hotel_id: number;
  room_id: number;
  num: number;
  checkin: Date;
  checkout: Date;
}

export default Reservation;
