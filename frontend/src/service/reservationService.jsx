export class reservationService {
  static getReservations = () => {
    return JSON.parse(localStorage.getItem("reservations"));
  }

  static getReservationOf = (uid) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.uid === "" + uid );
    return reservations;
  }

  static getReservationOfHotel = (hid) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.hid === "" + hid );
    return reservations;
  }

  static createReservation = (reservation) => {
    let reservations = this.getReservations();
    reservation.res_id = reservations.length + 1;
    reservations.push(reservation);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    return true;
  }

  static editReservation = (res_id, editedReservation) => {
    let reservations = this.getReservations();
    for (let i = 0; i < reservations.length; i++) {
      if ("" + res_id === "" + reservations[i].res_id) {
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

  static deleteReservation = (res_id) => {
    let reservations = this.getReservations();
    reservations = reservations.filter(reservation => "" + reservation.res_id !== "" + res_id);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    return true;
  }
}