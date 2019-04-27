import qs from 'qs';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import HotelCard from '../component/HotelCard';
import '../css/SearchResult.css';
import { hotelService } from '../service/hotelService';

export default class SearchResult extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const hotels = await hotelService.getHotels(search.checkin, search.checkout);
    let min = hotels.map(hotel => hotel.start_price).reduce((a, b) => Math.min(a, b), Infinity);
    min = min === Infinity ? 0 : min;
    let max = hotels.map(hotel => hotel.start_price).reduce((a, b) => Math.max(a, b), 0);
    max = max < min + 1000 ? min + 1000 : max;
    const priceRange = {
      min: min,
      max: max
    }
    this.props.setPriceRange(priceRange);
    this.setState({
      pathname: pathname,
      search: search,
      hotels: hotels
    });
  }

  render() {
    if (!this.state) {
      return <></>;
    }
    return (
      <div className="search-result-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            this.state.hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                  <HotelCard search={this.state.search} hotel={hotel} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
