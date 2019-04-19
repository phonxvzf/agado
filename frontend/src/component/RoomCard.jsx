import React, { Component } from 'react';
import { Card, Row, Col, Image, InputGroup, Form, Button, Badge, Collapse, Carousel, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import qs from 'qs';

import '../css/RoomCard.css';
import { hotelService } from '../service/hotelService';
import { userService } from '../service/userService';

export default class RoomCard extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      collapse: window.innerWidth <= 576,
      num: ""
    });
  }

  _onChange = (e) => {
    const target = e.currentTarget;
    this.setState({
      num: target.value === "" ? "" : Math.min(target.max, Math.max(target.value, target.min))
    });
  }

  getPaymentLink = () => {
    const pathname = "/payment";
    const search = qs.stringify({
      hid: this.state.search.hid,
      checkin: this.state.search.checkin,
      checkout: this.state.search.checkout,
      rid: this.props.rid,
      num: this.state.num
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  reserveRoom = (e) => {
    e.preventDefault();
    window.location.href = this.getPaymentLink();
  }

  render() {
    const room = this.props.room;
    const currentUser = this.state.currentUser;
    return (
      <Card className="shadow w-100">
        <Card.Body>
          <Card.Title className="bg-white py-2 mx-4"><h4>{room.name}</h4></Card.Title>
          <Row className="align-items-center">
            <Col xs={12} sm={5} md={6} lg={5} className="text-center">
              {
                room.imgs.length === 0 ?
                  <div className="ratio4-3">
                    <div className="bg-dark abs-center border-none" />
                  </div>
                  :
                  <Carousel fade interval={null}>
                    {
                      room.imgs.map(img => {
                        return (
                          <Carousel.Item>
                            <div className="ratio4-3">
                              {
                                img === "" ?
                                  <div className="bg-dark abs-center border-none" />
                                  : <Image className="absolute" src={img} fluid />
                              }
                            </div>
                          </Carousel.Item>
                        )
                      })
                    }
                  </Carousel>
              }
            </Col>
            <Col xs={12} sm={7} md={6} lg={7}>
              <Row className="my-3 text-center show-only-mobile">
                <Col>
                  <Button variant="dark" className="border-dark w-100" onClick={() => this.setState({ collapse: !this.state.collapse })}>
                    {this.state.collapse ? "Show Details" : "Hide Details"}
                  </Button>
                </Col>
              </Row>
              <Collapse in={!this.state.collapse}>
                <Row className="my-3 text-center">
                  <Col className="px-3 text-right">
                    <Badge variant="dark" className="room-card-property">
                      <div className="my-2">
                        <h6><i className="fas fa-bed"></i></h6>
                        <h6>{room.beds} Beds</h6>
                      </div>
                    </Badge>
                  </Col>
                  <Col className="px-3 text-left">
                    <Badge variant="dark" className="room-card-property">
                      <div className="my-2">
                        <h6><i className="fas fa-user-friends"></i></h6>
                        <h6>{room.maxPerson} People</h6>
                      </div>
                    </Badge>
                  </Col>
                </Row>
              </Collapse>
              <Collapse in={!this.state.collapse}>
                <Row noGutters>
                  {
                    room.amenities.map((isHas, idx) => {
                      if (idx && !isHas) {
                        return <></>;
                      }
                      const amenity = hotelService.amenities[idx === 0 ? !isHas + 0 : idx + 1];
                      return (
                        <Col xs={3} sm={2} md={3} lg={2} className="room-card-amenity text-center my-2 bold">
                          <p dangerouslySetInnerHTML={{ __html: amenity.tag }} />
                          {amenity.name}
                        </Col>
                      )
                    })
                  }
                </Row>
              </Collapse>
            </Col>
          </Row>
          <hr />
          {
            this.props.interval <= 0 && (!currentUser || currentUser.user_type !== "hotel_manager") ?
              <Alert variant="danger">Please enter dates to see prices.</Alert>
              :
              <Row className="align-items-center text-center">
                <Col xs={12} md={4} className="my-2">
                  <h5>Price per room: <strong>฿ {room.price * this.props.interval}</strong></h5>
                  <h6>(for {this.props.interval} days)</h6>
                </Col>
                <Col xs={12} md={5} className="my-2">
                  <Form id={"reservation" + this.props.rid} onSubmit={this.reserveRoom}>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text className="bg-dark border-dark text-white">Rooms</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        className="border-dark"
                        type="number"
                        onChange={this._onChange}
                        placeholder="Number"
                        min={0}
                        max={room.availableRoom}
                        value={this.state.num}
                        required />
                      <InputGroup.Append>
                        <InputGroup.Text className="bg-dark border-dark text-white">
                          Total Price: {room.price * this.props.interval * Math.max(this.state.num, 0)}
                        </InputGroup.Text>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form>
                </Col>
                <Col xs={12} md={3} className="my-2">
                  {
                    currentUser && currentUser.user_type === "traveler" ?
                      <Button type="submit" form={"reservation" + this.props.rid} variant="success" className="py-3 px-4">
                        <span className="h6">Reserve now</span>
                      </Button>
                      :
                      <OverlayTrigger overlay={<Tooltip>Please sign in with traveler account</Tooltip>}>
                        <span className="d-inline-block">
                          <Button disabled variant="success" className="py-3 px-4" style={{ pointerEvents: 'none' }}>
                            <span className="h6">Reserve now</span>
                          </Button>
                        </span>
                      </OverlayTrigger>
                  }

                </Col>
              </Row>
          }
        </Card.Body>
      </Card>
    )
  }
}
