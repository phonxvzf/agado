import React, { Component } from 'react'
import { userService } from '../service/userService';
import { reservationService } from '../service/reservationService';
import ReservationCard from '../component/ReservationCard';
import {  Row, Col } from 'react-bootstrap';
import qs from 'qs';

export default class Reservation extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let reservations = []
    if (currentUser && currentUser.user_type === "traveler") {
      reservations = reservationService.getReservationOf(currentUser.uid);
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
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Traveler to access this page.</h4>
        </div>
      )
    }
    return (
      <div className="search-result-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            this.state.reservations.length === 0 ?
            <div className="scroll-snap-child">
              <h1>Reservation</h1>
              <h4>You have no reservations at this time.</h4>
            </div>
            :
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
