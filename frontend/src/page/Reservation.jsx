import qs from 'qs';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReservationCard from '../component/ReservationCard';
import '../css/Reservation.css';
import { reservationService } from '../service/reservationService';
import { userService } from '../service/userService';

export default class Reservation extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let reservations = []
    if (currentUser && currentUser.user_type === "traveler") {
      reservations = await reservationService.getReservationOf(currentUser.user_id);
      reservations.sort((a, b) => {
        const x1 = new Date(a.checkin);
        const x2 = new Date(a.checkout);
        const y1 = new Date(b.checkin);
        const y2 = new Date(b.checkout);
        const now = new Date();
        let tx, ty;
        if (x2 <= now) {
          tx = 3;
        } else if (x1 <= now) {
          tx = 1;
        } else {
          tx = 2;
        }
        if (y2 <= now) {
          ty = 3;
        } else if (y1 <= now) {
          ty = 1;
        } else {
          ty = 2;
        }
        if (tx === ty) {
          if (tx === 3) {
            return y2 - x2;
          } else if (tx === 1) {
            return x2 - y2;
          } else {
            return x1 - y1;
          }
        }
        return tx - ty;
      });
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
    if (!this.state) {
      return <></>;
    }
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
      <div className="reservation-bg hotel-info">
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
