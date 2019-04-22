import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { hotelService } from '../service/hotelService';
import { reservationService } from '../service/reservationService';
import { reviewService } from '../service/reviewService';
import CustomModal from './CustomModal';
import ReviewModal from './ReviewModal';

export default class ReservationCard extends Component {
  componentWillMount() {
    const reservation = this.props.reservation;
    const oldReview = reviewService.getOldReview(reservation.user_id, reservation.hotel_id);
    this.setState({
      hotel: hotelService.getHotel(reservation.hotel_id),
      oldReview: oldReview
    })
  }

  getDayleft = () => {
    const checkin = this.props.reservation.checkin;
    const dayLeft = Math.max(0, (new Date(checkin) - new Date()) / 24 / 60 / 60 / 1000);
    return dayLeft.toFixed(0) > 1 ? dayLeft.toFixed(0) + " days left" :
      dayLeft.toFixed(0) === 1 ? "1 day left" :
        (dayLeft * 24).toFixed(0) > 1 ? (dayLeft * 24).toFixed(0) + " hours left" :
          (dayLeft * 24).toFixed(0) === 1 ? "1 hour left" :
            (dayLeft * 24 * 60).toFixed(0) > 1 ? (dayLeft * 24 * 60).toFixed(0) + " minutes left" :
              (dayLeft * 24 * 60).toFixed(0) === 1 ? "1 minute left" :
                (dayLeft * 24 * 60).toFixed(0) > 0 ? "< 1 minute left" :
                  "Passed";
  }

  getPrice = () => {
    const checkin = this.props.reservation.checkin;
    const checkout = this.props.reservation.checkout;
    const interval = Math.max(0, (new Date(checkout) - new Date(checkin)) / 24 / 60 / 60 / 1000);
    const hotel = hotelService.getHotel(this.props.reservation.hotel_id);
    const room = hotel.rooms[Number(this.props.reservation.room_id)];
    return interval * (room ? room.price : 0) * Number(this.props.reservation.num);
  }

  isPassed = () => {
    return new Date() >= new Date(this.props.reservation.checkin);
  }

  getHotelLink = () => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hotel_id: this.props.reservation.hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  cancelReservation = () => {
    const reservation_id = this.props.reservation.reservation_id;
    if (reservationService.deleteReservation(reservation_id)) {
      window.history.go();
    }
  }

  render() {
    const reservation = this.props.reservation;
    const hotel = this.state.hotel;
    return (
      <>
        <Card className="shadow">
          <Card.Header className="py-4">
            <Row className="align-items-center" noGutters={true}>
              <Col xs={8}>
                <Card.Title as="h6"><a className="text-dark" href={this.getHotelLink()}>{hotel.name}</a></Card.Title>
                <Card.Subtitle as="h6">{new moment(reservation.checkin).format("D MMM YYYY") + " - " + new moment(reservation.checkout).format("D MMM YYYY")}</Card.Subtitle>
              </Col>
              <Col xs={4} className="text-center">
                {this.getDayleft()}
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
          <Card.Body>
            <Card.Text>Room: {hotel.rooms[Number(reservation.room_id)] ? hotel.rooms[Number(reservation.room_id)].name : ""}</Card.Text>
            <Card.Text>Number of room: {reservation.num}</Card.Text>
            <Card.Text>Price: ฿ {this.getPrice()}</Card.Text>
          </Card.Body>
          <Card.Footer className="text-center">
            <Row className="align-items-center text-center" noGutters={true}>
              <Col>
                {
                  this.isPassed() ?
                    <Button className="px-4 py-2" variant="info" onClick={() => this.setState({ showModal: "review" })}>
                      {this.state.oldReview ? "Edit old review" : "Write a review"}
                    </Button>
                    : <Button className="px-4 py-2" variant="danger" onClick={() => this.setState({ showModal: "cancel_reservation_confirm" })}>Cancel</Button>
                }
              </Col>
            </Row>
          </Card.Footer>
        </Card>
        <ReviewModal
          hotel_id={reservation.hotel_id}
          oldReview={this.state.oldReview}
          showModal={this.state.showModal === "review"}
          closeModal={() => this.setState({ showModal: null })} />
        <CustomModal
          showModal={this.state.showModal === "cancel_reservation_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Are you sure to cancel this booking?"
          body={"You will not be able to revert this and you will get the refunding cash only ฿ " + (0.7 * this.getPrice()).toFixed(0) + " (70% of the total price)."}
          footer={
            <Button variant="danger" onClick={this.cancelReservation}>Yes, cancel it</Button>
          } />
      </>
    )
  }
}
