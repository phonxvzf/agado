import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import '../css/RoomSelection.css';
import RoomCard from './RoomCard';

export default class RoomSelection extends Component {
  componentWillMount() {
    this.setState({
      interval: this.getInterval(this.props.search.checkin, this.props.search.checkout)
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
    const rooms = this.props.rooms.filter(room => room.available_room > 0);
    return (
      rooms.length === 0 ? "" :
        <div>
          <h3 className="scroll-snap-child px-content">Select your room style</h3>
          {/* <ItemsCarousel
            className="scroll-snap-child"
            freeScrolling
            numberOfCards={1}
            gutter={-0.05 * window.innerWidth}> */}
            {
              rooms.map(room => {
                return (
                  <Row className="my-4 mx-1 scroll-snap-child px-content" key={room.room_id}>
                    <RoomCard search={this.props.search} currentUser={this.props.currentUser} room={room} room_id={room.room_id} interval={this.state.interval} />
                  </Row>
                );
              })
            }
          {/* </ItemsCarousel> */}
          <hr className="mb-5" />
        </div>
    )
  }
}
