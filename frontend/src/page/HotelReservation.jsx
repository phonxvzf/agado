import qs from 'qs';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import HotelReservationCard from '../component/HotelReservationCard';
import { hotelService } from '../service/hotelService';
import { reservationService } from '../service/reservationService';
import { userService } from '../service/userService';

export default class HotelReservation extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    const hotel = hotelService.getHotel(Number(search.hotel_id));

    let reservations = [];
    if (currentUser) {
      reservations = await reservationService.getReservationOfHotel(Number(search.hotel_id));
      reservations = reservations.filter(reservation => new Date(reservation.checkin) > new Date());
      reservations.sort((a, b) => new Date(a.checkin) < new Date(b.checkin));
    }

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager",
      hotel: hotel,
      reservations: reservations
    });
  }

  getProfileLink = (user_id) => {
    const pathname = "/profile";
    const search = qs.stringify({
      user_id: user_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getPrice = (reservation, room) => {
    const checkin = reservation.checkin;
    const checkout = reservation.checkout;
    const interval = Math.max(0, (new Date(checkout) - new Date(checkin)) / 24 / 60 / 60 / 1000);
    return interval * room.price * Number(reservation.num);
  }

  render() {
    if (!this.state) {
      return <div className="error-bg scroll-snap-child" />
    } else if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    } else if (!this.state.hotel) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      )
    } else if (!this.state.hotel.managers.includes(this.state.currentUser.user_id)) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You do not have a permission to manage this hotel yet.</h4>
        </div>
      )
    }
    const reservations = this.state.reservations;
    const hotel = this.state.hotel;
    return (
      reservations.length === 0 ?
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h4>This hotel have no reservations at this time.</h4>
        </div>
        :
        <div className="reservation-bg hotel-info">
          {this.getHotelSummary()}
          <hr />
          <Row>
            {
              reservations.map(reservation => {
                if (!reservation) return <></>;
                return (
                  <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child">
                    <HotelReservationCard reservation={reservation} hotel={hotel} />
                  </Col>
                )
              })
            }
          </Row>
        </div>
    )
  }

  getHotelSummary = () => {
    const hotel = this.state.hotel;
    return (
      <>
        <h2 className="scroll-snap-child">{hotel.name}</h2>
        <h4 className="">{hotel.city}</h4>
      </>
    )
  }
}
