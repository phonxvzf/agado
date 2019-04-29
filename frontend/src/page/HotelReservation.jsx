import qs from 'qs';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import HotelReservationCard from '../component/HotelReservationCard';
import { hotelService } from '../service/hotelService';
import { reservationService } from '../service/reservationService';
import { userService } from '../service/userService';
import Loading from './Loading';

export default class HotelReservation extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();

    hotelService.getHotel(Number(search.hotel_id)).then(hotel => this.setState({ hotel: hotel }));

    if (currentUser) {
      reservationService.getReservationOfHotel(Number(search.hotel_id))
        .then(reservations => {
          reservations = reservations.filter(reservation => new Date(reservation.checkout) > new Date());
          reservations.sort((a, b) => {
            if (new Date(a.checkin) <= new Date() && new Date(b.checkin) <= new Date()) {
              return new Date(a.checkout) - new Date(b.checkout);
            }
            return new Date(a.checkin) - new Date(b.checkin);
          });
          this.setState({
            reservations: reservations
          });
        });
    }

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager",
      hotel: undefined,
      reservations: undefined
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
    const hotel = this.state.hotel;
    const reservations = this.state.reservations;
    if (reservations === undefined) {
      return <Loading />
    } else if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    } else if (hotel === null) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      )
    } else if (hotel && !hotel.managers.includes(this.state.currentUser.user_id)) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You do not have a permission to manage this hotel yet.</h4>
        </div>
      )
    }
    return (
      reservations && reservations.length === 0 ?
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h4>This hotel have no reservations at this time.</h4>
        </div>
        :
        <div className="reservation-bg hotel-info">
          {this.getHotelSummary()}
          <hr />
          <Row>
            {
              reservations && reservations.map(reservation => {
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
        <h2 className="scroll-snap-child">{!hotel ? <>&nbsp;</> : hotel.name}</h2>
        <h4 className="">{!hotel ? <>&nbsp;</> : hotel.city}</h4>
      </>
    )
  }
}
