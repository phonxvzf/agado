import qs from 'qs';
import React, { Component } from 'react';
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { hotelService } from '../service/hotelService';
import CustomModal from './CustomModal';

export default class HotelManageCard extends Component {
  state = {
    showModal: null
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
      hotel_id: this.props.hotel.hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelReservationLink = () => {
    const pathname = "/hotel/reservation";
    const search = qs.stringify({
      hotel_id: this.props.hotel.hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  cancelMaagement = () => {
    if (hotelService.cancelManagement(Number(this.props.hotel.hotel_id), this.props.currentUser.user_id)) {
      window.location.href = "/myhotel";
    }
  }

  render() {
    const hotel = this.props.hotel;
    return (
      <>
        <Card className="shadow">
          <Button variant="link" className="text-secondary hover-dark abs-top-right border-none" onClick={() => this.setState({ showModal: "cancel_management_confirm" })}>
            <h5 className="my-0"><i className="fas fa-times" /></h5>
          </Button>
          <a className="link-only" href={this.getHotelLink()}>
            <Card.Header className="pt-4">
              <Row className="align-items-center text-dark" noGutters={true}>
                <Col className="mr-auto">
                  <Card.Title as="h5">{hotel.name}</Card.Title>
                  <Card.Subtitle as="h6">{hotel.city}</Card.Subtitle>
                </Col>
                <OverlayTrigger overlay={<Tooltip>{hotel.total_review} review{hotel.total_review > 1 ? "s" : ""}</Tooltip>}>
                  <Button variant="link" className="link-only px-0" href={this.getHotelLink() + "#hotel_reviews"}>
                    {this.getRatingStar(hotel.rating)}
                    <br />
                    <strong>Rating {hotel.rating.toFixed(1)}</strong>
                  </Button>
                </OverlayTrigger>
              </Row>
            </Card.Header>
            <div className="ratio4-3">
              {
                hotel.imgs[0] === "" ?
                  <div className="bg-dark abs-center border-none" />
                  : <Card.Img className="absolute border-rad-none" src={hotel.imgs[0]} />
              }
            </div>
          </a>
          <Card.Body className="hotel-desc-body">
            <Card.Text>{hotel.desc.length < 120 ? hotel.desc : hotel.desc.slice(0, 120) + "..."}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Row className="align-items-center text-center" noGutters={true}>
              <Col xs={6}>
                <Button className="px-4 py-2" variant="dark" href={this.getHotelReservationLink()}>Reservation</Button>
              </Col>
              <Col xs={6}>
                <Button className="px-4 py-2" variant="info" href={this.getHotelLink()}>View Hotel</Button>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
        <CustomModal
          showModal={this.state.showModal === "cancel_management_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Are you sure to cancel your management rights?"
          body="You will not be able to manage this hotel while other managers can still manage this hotel. Except if you are the last manager, the hotel will be removed from the system."
          footer={
            <Button variant="danger" onClick={this.cancelMaagement}>Yes, cancel it</Button>
          } />
      </>
    )
  }
}
