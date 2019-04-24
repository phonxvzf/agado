import qs from 'qs';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReservationCard from '../component/ReservationCard';
import '../css/Reservation.css';
import { reservationService } from '../service/reservationService';
import { userService } from '../service/userService';

export default class Reservation extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let reservations = []
    if (currentUser && currentUser.user_type === "traveler") {
      reservations = reservationService.getReservationOf(currentUser.user_id);
    }

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "traveler",
      reservations: reservations
    });
  }

  render() {
    if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Traveler to access this page.</h4>
        </div>
      )
    } else if (this.state.reservations.length === 0) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h4>You have no reservations at this time.</h4>
        </div>
      )
    }
    return (
      <div className="reservation-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            this.state.reservations.map(reservation => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child">
                  <ReservationCard reservation={reservation} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
