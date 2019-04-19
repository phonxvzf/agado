import React, { Component } from 'react';
import '../css/MyHotel.css';
import qs from 'qs';
import { Row, Col } from 'react-bootstrap';

import HotelManageCard from '../component/HotelManageCard';

import { userService } from '../service/userService';
import { hotelService } from '../service/hotelService';
import { reviewService } from '../service/reviewService';

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
    
    let hotels = currentUser ? hotelService.getHotelOf(currentUser.uid) : [];
    hotels = hotels.map(hotel => {
      const reviews = reviewService.getHotelReviews(hotel.hid);
      hotel.review = reviews.length;
      hotel.rating = reviews.length <= 0 ? 0 :
        (reviews.map(review => review.rating).reduce((a, b) => a + b, 0)) / reviews.length;
      return hotel
    })

    this.setState({
      hotels: hotels
    })
  }

  render() {
    if (!this.state.validUser) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    }
    return (
      <div className="my-hotel-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            this.state.hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hid}>
                  <HotelManageCard hotel={hotel} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
