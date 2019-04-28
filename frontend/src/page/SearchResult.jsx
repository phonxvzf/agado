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
    const priceRange = {
      min: min,
      max: max
    }
    this.props.setPriceRange(priceRange);

    const minPrice = search.min_price ? Math.max(Number(search.min_price).toFixed(0), priceRange.min) : priceRange.min;
    const maxPrice = search.max_price ? Math.min(Number(search.max_price).toFixed(0), priceRange.max) : priceRange.max;

    this.setState({
      pathname: pathname,
      search: search,
      hotels: hotels,
      filters: {
        hotel_name: search.hotel_name ? search.hotel_name : "",
        min_price: minPrice <= maxPrice ? minPrice : priceRange.min,
        max_price: minPrice <= maxPrice ? maxPrice : priceRange.max,
        rating: search.rating ? Number(search.rating) : 0,
        amenities: search.amenities ? Array.isArray(search.amenities) ? search.amenities.map(amenity => Number(amenity)) : [Number(search.amenities)] : [],
        sort_by: search.sort_by === "rating" ? "rating" : "price"
      }
    });
  }

  getFilteredHotels = () => {
    let hotels = this.state.hotels;
    const filters = this.state.filters;
    const name = filters.hotel_name.toLowerCase();
    const minPrice = filters.min_price;
    const maxPrice = filters.max_price;
    const rating = filters.rating;
    const amenities = filters.amenities;
    const sort_by = filters.sort_by;

    return (
      hotels.filter(hotel =>
        (hotel.name.toLowerCase().includes(name) || hotel.city.toLowerCase().includes(name) || hotel.address.toLowerCase().includes(name)) &&
        (hotel.start_price >= minPrice && hotel.start_price <= maxPrice) &&
        (hotel.rating >= rating) &&
        (hotel.rooms.some(room => (room.available_room === undefined || room.available_room > 0) && amenities.every(amenity => room.amenities.includes(amenity))))
      ).sort((a, b) => {
        if (sort_by === "price") return a.start_price - b.start_price;
        else return b.rating - a.rating;
      })
    );
  }

  render() {
    if (!this.state) {
      return <></>;
    }
    const hotels = this.getFilteredHotels();
    return (
      <div className="search-result-bg">
        <div className="scroll-snap-child" />
        <Row>
          {
            hotels.map(hotel => {
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
