import React, { Component } from 'react';

import { Col, Row, Image, Button, Card } from 'react-bootstrap';
import qs from 'qs';

import { reservationService } from '../service/reservationService';
import { userService } from '../service/userService';
import { hotelService } from '../service/hotelService';

export default class HotelReservation extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    const hotel = hotelService.getHotel(search.hid);

    let reservations = [];
    if (currentUser) {
      reservations = reservationService.getReservationOfHotel(search.hid).reduce((r, reservation) => {
        r[reservation.rid] = (r[reservation.rid] || []).concat(reservation);
        return r;
      }, []);
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

  getProfileLink = (uid) => {
    const pathname = "/profile";
    const search = qs.stringify({
      uid: uid
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
    if (!this.state.validUser) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    } else if (!this.state.hotel) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      )
    } else if (!this.state.hotel.managers.includes(this.state.currentUser.uid)) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You do not have a permission to manage this hotel yet.</h4>
        </div>
      )
    }
    const reservations = this.state.reservations;
    const hotel = this.state.hotel;
    return (
      <div className="hotel-bg px-auto hotel-info">
        {
          reservations.length === 0 ?
            <div className="scroll-snap-child">
              <h1>Reservation</h1>
              <h4>This hotel have no reservations at this time.</h4>
            </div>
            :
            <>
              {
                reservations.map(reservation => {
                  if (!reservation) return;
                  const room = hotel.rooms[reservation[0].rid];
                  return (
                    <div className="px-content scroll-snap-child mb-5">
                      <div className="px-content">
                        <Card>
                          <Card.Header>
                            <Row className="align-items-center text-center justify-content-center">
                              <h4 className="text-dark mr-md-4 my-2">{room.name}</h4>
                              {/* <Button variant="info" className="my-2" href={this.getHotelLink(hotel.hid)}>View hotel</Button> */}
                            </Row>
                          </Card.Header>
                          {/* <hr /> */}
                          <Card.Body>
                            {
                              reservation.map((r, idx) => {
                                const user = userService.getUser(r.uid);
                                return (
                                  <>
                                    {idx > 0 ? <hr /> : ""}
                                    <Row className="align-items-center justify-content-center my-3">
                                      <Col xs={10} md={4}>
                                        <a className="text-dark" href={this.getProfileLink(user.uid)}>
                                          <Row className="align-items-center">
                                            <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                                            <Col>{this.state.currentUser && "" + this.state.currentUser.uid === "" + user.uid ? <strong>Me</strong> : user.first_name + " " + user.last_name}</Col>
                                          </Row>
                                        </a>
                                      </Col>
                                      <Col xs={10} md={4} className="my-3">
                                        <h6>Date: {new Date(r.checkin).toLocaleDateString() + " - " + new Date(r.checkout).toLocaleDateString()}</h6>
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
            </>
        }
      </div>
    )
  }
}
