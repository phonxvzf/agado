import React, { Component } from 'react';
import { userService } from '../service/userService';
import qs from 'qs';
import '../css/Payment.css';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

import { hotelService } from '../service/hotelService';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { reservationService } from '../service/reservationService';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#343a40'
    },
    secondary: {
      main: '#f44336',
    },
  },
});

export default class Payment extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      step: 0,
      validUser: search.hid && search.checkin && search.checkout && search.rid && search.rid && search.num && currentUser && currentUser.user_type === "traveler"
    });
  }

  getPrice = () => {
    const checkin = this.state.search.checkin;
    const checkout = this.state.search.checkout;
    const interval = Math.max(0, (new Date(checkout) - new Date(checkin)) / 24 / 60 / 60 / 1000);
    const hotel = hotelService.getHotel(this.state.search.hid)
    return interval * hotel.rooms[Number(this.state.search.rid)].price * Number(this.state.search.num);
  }

  bookNow = (e) => {
    e.preventDefault();
    const search = this.state.search;
    const reservation = {
      uid: this.state.currentUser.uid,
      hid: search.hid,
      checkin: search.checkin,
      checkout: search.checkout,
      rid: search.rid,
      num: search.num
    }
    if (reservationService.createReservation(reservation)) {
      this.setState({
        step: 2
      })
    }
  }

  render() {
    if (!this.state.validUser) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Traveler to access this page.</h4>
        </div>
      )
    }
    return (
      <div className="hotel-bg px-auto hotel-info">
        {this.getProgressComponent()}
        {this.getContentComponent()}
      </div>
    )
  }

  getProgressComponent = () => {
    return (
      <div className="px-2 px-md-5 scroll-snap-child">
        <MuiThemeProvider theme={theme}>
          <Stepper activeStep={this.state.step} alternativeLabel className="bg-none">
            <Step><StepLabel>Informations</StepLabel></Step>
            <Step><StepLabel>Payment</StepLabel></Step>
            <Step><StepLabel>Completed</StepLabel></Step>
          </Stepper>
        </MuiThemeProvider>
      </div>
    )
  }

  getContentComponent = () => {
    const step = this.state.step;
    if (step === 0) {
      return this.getInfoComponent();
    } else if (step === 1) {
      return this.getPaymentComponent();
    } else if (step === 2) {
      return this.getCompletedComponent();
    }
  }

  getInfoComponent = () => {
    const currentUser = this.state.currentUser;
    const hotel = hotelService.getHotel(this.state.search.hid);
    return (
      <>
        <div className="px-payment">
          <h4>Your information:</h4>
          <div className="ml-3 ml-md-5">
            <h6>Full name: {currentUser.first_name + " " + currentUser.last_name}</h6>
            <h6>Gender: {currentUser.gender}</h6>
            <h6>Email: {currentUser.email}</h6>
            <h6>Tel: {currentUser.phone_num}</h6>
          </div>
          <br />
          <h4>Booking information:</h4>
          <div className="ml-3 ml-md-5">
            <h6>Date: {new Date(this.state.search.checkin).toLocaleDateString() + " - " + new Date(this.state.search.checkout).toLocaleDateString()}</h6>
            <h6>Hotel: {hotel.name}</h6>
            <h6>Room: {hotel.rooms[Number(this.state.search.rid)].name}</h6>
            <h6>Number of room: {this.state.search.num}</h6>
            <h6>Price: ฿ {this.getPrice()}</h6>
          </div>
        </div>
        <br />
        <Row className="justify-content-center">
          <Col />
          <Col>
            <Button variant="dark" className="mx-5 px-3" onClick={() => this.setState({ step: 1 })}>Next</Button>
          </Col>
        </Row>
      </>
    )
  }

  getPaymentComponent = () => {
    const payment = this.state.payment;
    return (
      <Form id="payment" onSubmit={this.bookNow}>
        <div className="px-payment">
          <h4>Payment information:</h4>
          <div className="mx-3 mx-md-5">
            <Row className="align-items-center">
              <Col xs={7} md={5}><h6 className="my-0">Payment method: </h6></Col>
              <Col>
                <Form.Control as="select" onChange={(e) => this.setState({ payment: { ...payment, method: e.currentTarget.value } })} required>
                  <option>VISA</option>
                  <option>mastercard</option>
                  <option>JCB</option>
                  <option>American Express</option>
                </Form.Control>
              </Col>
            </Row>
            <br />
            <Row className="align-items-center">
              <Col><h6>Number of credit/debit card: </h6></Col>
              <Col xs={12}>
                <Form.Control type="number" onChange={(e) => this.setState({ payment: { ...payment, number: e.currentTarget.value } })} required />
              </Col>
            </Row>
            <br />
            <Row className="align-items-center">
              <Col><h6>Name on the card:</h6></Col>
              <Col xs={12}>
                <Form.Control type="text" onChange={(e) => this.setState({ payment: { ...payment, name: e.currentTarget.value } })} required />
              </Col>
            </Row>
            <br />
            <Row className="align-items-center">
              <Col><h6>Expired date:</h6></Col>
              <Col><h6>CVC/CVV code:</h6></Col>
            </Row>
            <Row className="align-items-center">
              <Col>
                <Form.Control type="text" onChange={(e) => this.setState({ payment: { ...payment, exp: e.currentTarget.value } })} required />
              </Col>
              <Col>
                <Form.Control type="number" onChange={(e) => this.setState({ payment: { ...payment, cvc: e.currentTarget.value } })} required />
              </Col>
            </Row>
          </div>
        </div>
        <br />
        <Row className="justify-content-center">
          <Col className="text-right">
            <Button variant="dark" className="mx-4 px-3" onClick={() => this.setState({ step: 0 })}>Back</Button>
          </Col>
          <Col>
            <Button type="submit" form="payment" variant="success" className="mx-4 px-3">Book now</Button>
          </Col>
        </Row>
      </Form>
    )
  }

  getCompletedComponent = () => {
    return (
      <>
        <div className="px-payment">
          <h4>Booking completed</h4>
          <div className="mx-3 mx-md-5 text-left">
            Thank you for choosing us, you can check the information of this booking at the Reservation Menu.
          </div>
        </div>
        <br />
        <Row className="justify-content-center">
          <Button variant="success" href="/reservation">View Reservation</Button>
        </Row>
      </>
    )
  }
}