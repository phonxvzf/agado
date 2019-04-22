import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
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
      reservations = await reservationService.getReservationOfHotel(Number(search.hotel_id)).reduce(async (prev, reservation) => {
        let r = await prev;
        reservation.user = await userService.getUser(reservation.user_id);
        r[reservation.room_id] = (r[reservation.room_id] || []).concat(reservation);
        return r;
      }, Promise.resolve([]));
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
          <h1>Reservation</h1>
          <h4>This hotel have no reservations at this time.</h4>
        </div>
        :
        <div className="hotel-bg px-auto hotel-info">
          {
            reservations.map(reservation => {
              if (!reservation) return <></>;
              const room = hotel.rooms[Number(reservation[0].room_id)];
              return (
                <div className="px-content scroll-snap-child mb-5">
                  <div className="px-content">
                    <Card>
                      <Card.Header>
                        <Row className="align-items-center text-center justify-content-center">
                          <h4 className="text-dark mr-md-4 my-2">{room.name}</h4>
                          {/* <Button variant="info" className="my-2" href={this.getHotelLink(hotel.hotel_id)}>View hotel</Button> */}
                        </Row>
                      </Card.Header>
                      {/* <hr /> */}
                      <Card.Body>
                        {
                          reservation.map((r, idx) => {
                            const user = r.user;
                            return (
                              <>
                                {idx > 0 ? <hr /> : ""}
                                <Row className="align-items-center justify-content-center my-3">
                                  <Col xs={10} md={4}>
                                    <a className="text-dark" href={this.getProfileLink(user.user_id)}>
                                      <Row className="align-items-center">
                                        <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                                        <Col>{this.state.currentUser && "" + this.state.currentUser.user_id === "" + user.user_id ? <strong>Me</strong> : user.first_name + " " + user.last_name}</Col>
                                      </Row>
                                    </a>
                                  </Col>
                                  <Col xs={10} md={4} className="my-3">
                                    <h6>Date: {new moment(r.checkin).format("D MMM YYYY")  + " - " + new moment(r.checkout).format("D MMM YYYY") }</h6>
                                    <h6>Number of room: {r.num}</h6>
                                    <h6>Price: ฿ {this.getPrice(r, room)}</h6>
                                  </Col>
                                </Row>
                              </>
                            )
                          })
                        }
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              )
            })
          }
        </div >
    )
  }
}
