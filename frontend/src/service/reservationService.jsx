export class reservationService {
  static getReservations = () => {
    return JSON.parse(localStorage.getItem("reservations"));
  }

  static getReservationOf = (user_id) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.user_id === "" + user_id );
    return reservations;
  }

  static getReservationOfHotel = (hotel_id) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.hotel_id === "" + hotel_id );
    return reservations;
  }

  static createReservation = (reservation) => {
    let reservations = this.getReservations();
    reservation.reservation_id = reservations.length + 1;
    reservations.push(reservation);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    return true;
  }

  static editReservation = (reservation_id, editedReservation) => {
    let reservations = this.getReservations();
    for (let i = 0; i < reservations.length; i++) {
      if ("" + reservation_id === "" + reservations[i].reservation_id) {
        reservations[i] = {
          ...reservations[i],
          ...editedReservation
        }
        localStorage.setItem("reservations", JSON.stringify(reservations));
        return true;
      }
    }
    return false;
  }

  static deleteReservation = (reservation_id) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.reservation_id !== "" + reservation_id);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    return true;
  }
}