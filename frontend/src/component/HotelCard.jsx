import React, { Component } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import qs from 'qs';

import '../css/HotelCard.css'

export default class HotelCard extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      pathname: pathname,
      search: search
    });
  }

  getRatingStar = (rating) => {
    rating = Math.round(rating * 2) / 2;

    let ratingStar = [];
    let key = 1;

    for (let i = 0; i < rating - 0.5; ++i) {
      const star = <i className="fas fa-star" key={key++} />;
      ratingStar.push(star);
    }
    if (rating % 1 !== 0) {
      const halfStar = <i className="fas fa-star-half-alt" key={key++} />;
      ratingStar.push(halfStar);
      rating += 0.5;
    }
    for (let i = 0; i < 5 - rating; ++i) {
      const emptyStar = <i className="far fa-star" key={key++} />;
      ratingStar.push(emptyStar);
    }
    return ratingStar;
  }

  getHotelLink = () => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hid: this.props.hotel.hid,
      checkin: this.state.search.checkin,
      checkout: this.state.search.checkout
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    const hotel = this.props.hotel;
    return (
      <Card className="shadow">
        <Card.Header className="py-4">
          <Row className="align-items-center" noGutters={true}>
            <Col xs={8}>
              <Card.Title as="h6">{hotel.name}</Card.Title>
              <Card.Subtitle as="h6">{hotel.city}</Card.Subtitle>
            </Col>
            <Col xs={4} className="text-center">
              {this.getRatingStar(hotel.rating)}
              <br />
              {hotel.review} reviews
            </Col>
          </Row>
        </Card.Header>
        <div className="ratio4-3">
          {
            hotel.imgs[0] === "" ?
              <div className="bg-dark abs-center border-none" />
              : <Card.Img className="absolute border-rad-none" src={hotel.imgs[0]} />
          }
        </div>
        <Badge variant="info" className="right-card"><div className="price mx-4 my-2">฿ {hotel.price}</div></Badge>
        <Card.Body className="hotel-desc">
          <Card.Text>{hotel.desc.length < 120 ? hotel.desc : hotel.desc.slice(0, 120) + "..."}</Card.Text>
        </Card.Body>
        <Card.Footer>
          <Row className="align-items-center text-center" noGutters={true}>
            <Col xs={5}>
              <i className="fas fa-door-open" />
              <br />
              {hotel.roomLeft} rooms left
            </Col>
            <Col xs={1} />
            <Col xs={6}>
              <Button className="w-100 py-2" variant="info" href={this.getHotelLink()}>View Hotel</Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    )
  }
}
