import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import ItemsCarousel from 'react-items-carousel';
import qs from 'qs';

import RoomCard from './RoomCard';
import '../css/RoomSelection.css';
import { hotelService } from '../service/hotelService';

export default class RoomSelection extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      pathname: pathname,
      search: search
    });

    let rooms = [];
    let room = {
      rid: 1,
      name: "MUTHI maya Forest Pool Villa",
      imgs: ['/image/hotel2-3.jpg',
        '/image/hotel2-4.jpg'],
      beds: 2,
      maxPerson: 2,
      price: 890,
      availableRoom: 23,
      amenities: Array(12).fill().map(() => Math.random() > 0.5)
    };

    for (let i = 0; i < 3; ++i) {
      room.rid = i + 1;
      rooms.push(JSON.parse(JSON.stringify(room)));
    }

    const hotel = hotelService.getHotel(search.hid);
    if (hotel) {
      rooms = hotel.rooms;
    }

    this.setState({
      rooms: rooms,
      interval: this.getInterval(search.checkin, search.checkout)
    });
  }

  getInterval = (checkin, checkout) => {
    if (checkin !== undefined && checkin !== "" && checkout !== undefined && checkout !== "") {
      const interval = (new Date(checkout) - new Date(checkin)) / 24 / 60 / 60 / 1000;
      return Math.max(interval, 0);
    }
    return 0;
  }

  render() {
    return (
      this.state.rooms.length === 0 ? "" :
        <div>
          <h3 className="scroll-snap-child px-content">Select your room style</h3>
          <ItemsCarousel
            className="scroll-snap-child"
            freeScrolling
            numberOfCards={1}
            gutter={-0.05 * window.innerWidth}>
            {
              this.state.rooms.map((room, idx) => {
                return (
                  <Row className="my-4 ml-2 w-90" key={room.rid}>
                    <RoomCard room={room} rid={idx} interval={this.state.interval} />
                  </Row>
                );
              })
            }
          </ItemsCarousel>
          <hr className="mb-5" />
        </div>
    )
  }
}
