import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import HotelCard from '../component/HotelCard';
import '../css/SearchResult.css';
import { hotelService } from '../service/hotelService';
import Loading from './Loading';

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
      priceRange: priceRange,
      filters: {
        hotel_name: search.hotel_name ? search.hotel_name : "",
        min_price: minPrice <= maxPrice ? minPrice : priceRange.min,
        max_price: minPrice <= maxPrice ? maxPrice : priceRange.max,
        rating: search.rating ? Number(search.rating) : 0,
        amenities: search.amenities ? Array.isArray(search.amenities) ? search.amenities.map(amenity => Number(amenity)) : [Number(search.amenities)] : [],
        sort_by: search.sort_by === "price" ? "price" : "rating"
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isFiltering) {
      this.applyFilter();
      this.props.setFiltering(false);
    }
  }

  activateHalf = (hotels) => {
    const population = hotels.length;
    const selected = hotels.map(hotel => hotel.hotel_id).sort(() => 0.5 - Math.random()).slice(0, (population / 2).toFixed(0));
    const deleted = selected.slice(0, 3);
    const losted = selected.slice(3);
    deleted.forEach((id, i) => {
      this.activate = setTimeout(() => {
        setTimeout(() => {
          document.querySelector("#hotel_" + id).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }, 300 + (2000 * i));
        setTimeout(() => {
          document.querySelector("#hotel_" + id).setAttribute('class', 'life dead');
        }, 600 + (2000 * i));
      }, 300);
    });
    losted.forEach(id => {
      this.activate = setTimeout(() => {
        setTimeout(() => {
          document.querySelector("#hotel_" + id).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }, 300 + (2000 * 3));
        setTimeout(() => {
          document.querySelector("#hotel_" + id).setAttribute('class', 'life dead');
        }, 600 + (2000 * 3));
      }, 300);
    });
    setTimeout(() => {
      document.querySelector("#result").scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      setTimeout(() => {
        const decrease = this.state.half / 10;
        document.querySelector("#result").setAttribute('class', 'text-danger bold');
        this.lostPop = setInterval(() => {
          if (this.state.half - (hotels.length / 2).toFixed(0) <= 1e-5) {
            // document.querySelector("#result").setAttribute('class', '');
            this.props.setActivate(false);
            clearInterval(this.lostPop);
            return;
          }
          this.setState({
            half: this.state.half - decrease
          })
        }, 100)
      }, 500);
    }, 9000);
  }

  applyFilter = () => {
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const priceRange = this.state.priceRange;
    const minPrice = search.min_price ? Math.max(Number(search.min_price).toFixed(0), priceRange.min) : priceRange.min;
    const maxPrice = search.max_price ? Math.min(Number(search.max_price).toFixed(0), priceRange.max) : priceRange.max;

    this.setState({
      filters: {
        hotel_name: search.hotel_name ? search.hotel_name : "",
        min_price: minPrice <= maxPrice ? minPrice : priceRange.min,
        max_price: minPrice <= maxPrice ? maxPrice : priceRange.max,
        rating: search.rating ? Number(search.rating) : 0,
        amenities: search.amenities ? Array.isArray(search.amenities) ? search.amenities.map(amenity => Number(amenity)) : [Number(search.amenities)] : [],
        sort_by: search.sort_by === "price" ? "price" : "rating"
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

    if (name === 'thanos') {
      if (!this.props.isActivate && !this.state.activated) {
        this.props.setActivate(true);
        this.setState({
          activated: true,
          half: hotels.length
        });
        this.activateHalf(hotels);
      }
      return hotels;
    }

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
      return <Loading />
    }
    let hotels = this.getFilteredHotels();
    if (hotels && hotels.length === 0) {
      return (
        <div className="search-result-bg text-secondary">
          <div className="scroll-snap-child mt-5" />
          <h1>No results found</h1>
          <h4>There are no hotels match your search and filter criteria.</h4>
          <hr />
          <h4>Suggestion:&nbsp;&nbsp;&nbsp;
            <Button variant="secondary" className="my-2" href="/search">See recommended hotels</Button>
          </h4>
        </div>
      );
    }
    return (
      <div className="search-result-bg hotel-info">
        <div className="scroll-snap-child" />
        <Row className="mt-5 mb-3 align-items-center">
          <Col><hr /></Col>
          <h5 id="result">Result: {this.state.activated ? this.state.half.toFixed(0) : hotels.length} hotel{hotels.length >= 2 ? "s" : ""}</h5>
          <Col><hr /></Col>
        </Row>
        <Row>
          {
            hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                  <div id={"hotel_" + hotel.hotel_id} className="life">
                    <HotelCard search={this.state.search} hotel={hotel} />
                  </div>
                </Col>
              )
            })
          }
        </Row>
        <Row className="my-3 align-items-center">
          <Col><hr /></Col>
          <h5 className="text-secondary">No more results</h5>
          <Col><hr /></Col>
        </Row>
      </div>
    )
  }
}
