import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { userService } from '../service/userService';

export default class HotelReservationCard extends Component {
  state = {
    user: null
  }

  async componentWillMount() {
    const user = await userService.getUser(this.props.reservation.user_id);
    this.setState({
      user: user
    });
  }

  getDayleft = () => {
    const checkin = this.props.reservation.checkin;
    const checkout = this.props.reservation.checkout;
    const dayLeft = Math.max(0, (new Date(checkin) - new Date()) / 24 / 60 / 60 / 1000);
    if (new Date(checkout) <= new Date()) {
      return "Passed";
    } else if (new Date(checkin) <= new Date()) {
      return "During";
    } 
    return dayLeft.toFixed(0) > 1 ? dayLeft.toFixed(0) + " days left" :
      dayLeft.toFixed(0) === 1 ? "1 day left" :
        (dayLeft * 24).toFixed(0) > 1 ? (dayLeft * 24).toFixed(0) + " hours left" :
          (dayLeft * 24).toFixed(0) === 1 ? "1 hour left" :
            (dayLeft * 24 * 60).toFixed(0) > 1 ? (dayLeft * 24 * 60).toFixed(0) + " minutes left" :
              (dayLeft * 24 * 60).toFixed(0) === 1 ? "1 minute left" :
                (dayLeft * 24 * 60).toFixed(0) > 0 ? "< 1 minute left" :
                  "Passed";
  }

  getPrice = (price) => {
    const checkin = this.props.reservation.checkin;
    const checkout = this.props.reservation.checkout;
    const interval = Math.max(0, (new Date(checkout) - new Date(checkin)) / 24 / 60 / 60 / 1000);
    return interval * price * Number(this.props.reservation.num);
  }

  getProfileLink = (user_id) => {
    const pathname = "/profile";
    const search = qs.stringify({
      user_id: user_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    const reservation = this.props.reservation;
    const hotel = this.props.hotel;
    const room = hotel.rooms.filter(room => room.room_id === Number(reservation.room_id))[0];
    const user = this.state.user;
    const days = this.getDayleft();
    if (!user) {
      return <></>;
    }
    return (
      <Card className="shadow">
        <Card.Header className="py-4">
          <Row className="align-items-end" noGutters>
            <Col xs={8}>
              <Card.Title as="h6">{room.name}</Card.Title>
              <Card.Subtitle as="h6">{moment(reservation.checkin).format("D MMM YYYY") + " - " + moment(reservation.checkout).format("D MMM YYYY")}</Card.Subtitle>
            </Col>
            <Col xs={4} className="text-center">
            <Badge variant={(days === "Passed" ? "secondary" : days === "During" ? "success" : "dark")}>{days}</Badge>
            </Col>
          </Row>
        </Card.Header>
        {/* <div className="ratio4-3">
          {
            room.imgs.length === 0 ?
              <div className="bg-dark abs-center border-none" />
              : <Card.Img className="absolute border-rad-none" src={room.imgs[0]} />
          }
        </div> */}
        <a className="link-only">
          <Card.Body>
            <a className="text-dark d-inline" href={this.getProfileLink(user.user_id)}>
              <Row className="align-items-center mx-2">
                <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                <Col>
                  <strong>{user.first_name + " " + user.last_name}</strong>
                  <br />
                  {user.email}
                  <br />
                  Tel: {user.phone_num}
                </Col>
              </Row>
            </a>
          </Card.Body>
        </a>
        <Card.Footer className="text-center">
          <Row className="align-items-center text-center" noGutters={true}>
            <Col>
              <i className="fas fa-door-open" />
              <br />
              {reservation.num} Reserved rooms
            </Col>
            <Col >
              Price: {this.getPrice(room.price)}
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    )
  }
}
