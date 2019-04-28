import axios from 'axios';
import { userService } from "./userService";

export class reservationService {
  static getReservations = () => {
    return JSON.parse(localStorage.getItem("reservations"));
  }

  static getReservationOf = async () => {
    return await axios.get('/reservation', {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return [];
      })
    // let reservations = this.getReservations();
    // reservations = reservations.filter(reservation => "" + reservation.user_id === "" + user_id );
    // return reservations;
  }

  static getReservationOfHotel = async (hotel_id) => {
    return await axios.get(`/reservation/of_hotel?hotel_id=${hotel_id}`, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return [];
      })
    // let reservations = this.getReservations();
    // reservations = reservations.filter(reservation => "" + reservation.hotel_id === "" + hotel_id );
    // return reservations;
  }

  static createReservation = async (reservation) => {
    return await axios.post('/reservation', reservation, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reservations = this.getReservations();
    // reservation.reservation_id = reservations.length + 1;
    // reservations.push(reservation);
    // localStorage.setItem("reservations", JSON.stringify(reservations));
    // return true;
  }

  static editReservation = async (reservation_id, editedReservation) => {
    return await axios.put(`/reservation?reservation_id=${reservation_id}`, editedReservation, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reservations = this.getReservations();
    // for (let i = 0; i < reservations.length; i++) {
    //   if ("" + reservation_id === "" + reservations[i].reservation_id) {
    //     reservations[i] = {
    //       ...reservations[i],
    //       ...editedReservation
    //     }
    //     localStorage.setItem("reservations", JSON.stringify(reservations));
    //     return true;
    //   }
    // }
    // return false;
  }

  static deleteReservation = async (reservation_id) => {
    return await axios.delete(`/reservation?reservation_id=${reservation_id}`, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reservations = this.getReservations();
    // reservations = reservations.filter(reservation => "" + reservation.reservation_id !== "" + reservation_id);
    // localStorage.setItem("reservations", JSON.stringify(reservations));
    // return true;
  }
}