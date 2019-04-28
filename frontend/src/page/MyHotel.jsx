import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import HotelManageCard from '../component/HotelManageCard';
import '../css/MyHotel.css';
import { hotelService } from '../service/hotelService';
import { userService } from '../service/userService';

export default class MyHotel extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    const hotels = currentUser ? await hotelService.getHotelOf(currentUser.user_id) : [];
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager",
      hotels: hotels
    });
  }

  getSearchLink = () => {
    const pathname = "/search";
    const search = qs.stringify({
      hotel_name: this.state.search.hotel_name
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    if (!this.state) {
      return <></>;
    }
    if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    } else if (this.state.hotels.length === 0) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          {this.getActionButtons()}
          <h4>You have no permission to manage any hotel at this time.</h4>
        </div>
      )
    }
    return (
      <div className="my-hotel-bg">
        <div className="scroll-snap-child" />
        {this.getActionButtons()}
        <Row>
          {
            this.state.hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                  <HotelManageCard hotel={hotel} currentUser={this.state.currentUser} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }

  getActionButtons = () => {
    return (
      <Form className="justify-content-end my-2" inline onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
        <Row noGutters>
          <Col>
            <InputGroup className="shadow">
              <Form.Control
                type="text"
                onChange={(e) => this.setState({ search: { ...this.state.search, hotel_name: e.currentTarget.value } })}
                placeholder="Find hotels"
                defaultValue={this.state.search.hotel_name}
                autoFocus />
              <InputGroup.Append>
                <Button type="submit" variant="dark" className="border-none"><i className="fas fa-search" /></Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Button variant="success px-3 ml-2 ml-md-4 text-right bold shadow" href="/hotel/create">
            <i className="fas fa-plus-square" />&nbsp;&nbsp;Create hotel
          </Button>
        </Row>
      </Form>
    )
  }
}
