import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import qs from 'qs';

import HotelCard from '../component/HotelCard';

import '../css/SearchResult.css';
import { hotelService } from '../service/hotelService';
import { reviewService } from '../service/reviewService';

export default class SearchResult extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      pathname: pathname,
      search: search
    });

    let hotels = [];
    let hotel = {
      hid: 1,
      name: "New York Skyline Hotel",
      city: "New York",
      address: "1/3 Moo 6, Thanarat Road, Moo Si, Pakchong, Khao Yai National Park, Khao Yai, Thailand, 30130",
      desc: "Take a look at New York view, the best way to see this city. You will find all the classic buildings, sights and more plus. Bootstrap includes a few general use CSS transitions that can be applied to a number of components. Add a collapse toggle animation to an element or component.",
      rating: 2.7,
      review: 134,
      reviews: [84, 32, 2, 11, 5],
      price: 7500,
      roomLeft: 26,
      imgs: ['/image/hotel2-1.jpg',
        '/image/hotel2-2.jpg',
        '/image/hotel2-3.jpg',
        '/image/hotel2-4.jpg',
        '/image/hotel2-5.jpg',
        '/image/hotel1.jpg']
    };

    for (let i = 0; i < 7; ++i) {
      hotel.hid = i + 1;
      let h = hotelService.getHotel(hotel.hid);
      if (h) {
        const r = reviewService.getHotelReviews(hotel.hid);
        h.rating = r.length > 0 ? (r.map(review => review.rating).reduce((a, b) => a + b, 0)) / r.length : 0;
        h.review = r.length;
        h.reviews = []
        r.forEach(review => h.reviews[5 - review.rating] = h.reviews[5 - review.rating] + 1);
        h.price = h.rooms.map(room => room.price).reduce((a, b) => Math.min(a, b), Infinity);
        h.price = h.price === Infinity ? 0 : h.price;
        h.roomLeft = h.rooms.map(room => room.availableRoom).reduce((a, b) => a + b, 0);
        hotels.push(h)
      } else {
        hotels.push(JSON.parse(JSON.stringify(hotel)));
      }
    }

    let min = hotels.map(hotel => hotel.price).reduce((a, b) => Math.min(a, b), Infinity);
    min = min === Infinity ? 0 : min;
    let max = hotels.map(hotel => hotel.price).reduce((a, b) => Math.max(a, b), 0);
    const priceRange = {
      min: min,
      max: max
    }

    this.props.setPriceRange(priceRange);

    this.setState({
      hotels: hotels
    });
  }

  render() {
    return (
      <div className="search-result-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            this.state.hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hid}>
                  <HotelCard hotel={hotel} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
