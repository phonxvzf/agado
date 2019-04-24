import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import HotelManageCard from '../component/HotelManageCard';
import '../css/MyHotel.css';
import { hotelService } from '../service/hotelService';
import { userService } from '../service/userService';

export default class MyHotel extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager"
    });

    const hotels = currentUser ? hotelService.getHotelOf(currentUser.user_id) : [];

    this.setState({
      hotels: hotels
    })
  }

  render() {
    if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    } else if (this.state.hotels.length === 0) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          {this.getActionButtons()}
          <h4>You have no permission to manage any hotel at this time.</h4>
        </div>
      )
    }
    return (
      <div className="my-hotel-bg">
        <div className="scroll-snap-child" />
        {this.getActionButtons()}
        <Row>
          {
            this.state.hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                  <HotelManageCard hotel={hotel} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }

  getActionButtons = () => {
    return (
      <Col className="text-right">
        <Button variant="dark py-2 px-3 my-2 text-right bold" href="/search">
          <i className="fas fa-search" />&nbsp;&nbsp;Find hotels
        </Button>
        <Button variant="success py-2 px-3 my-2 ml-2 ml-md-4 text-right bold" href="/hotel/create">
          <i className="fas fa-plus-square" />&nbsp;&nbsp;Create hotel
        </Button>
      </Col>
    )
  }
}
