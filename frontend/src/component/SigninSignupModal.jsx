import React, { Component } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

import CustomModal from './CustomModal';

import { userService } from '../service/userService';

import '../css/SigninSignupModal.css';

export default class SigninSignupModal extends Component {
  state = {
    active: "signin",
    showModal: null
  }

  signin = (e) => {
    e.preventDefault();
    const signin = this.state.signin;
    const user = {
      username: signin.username,
      password: signin.password,
      user_type: this.props.type === "Traveler" ? "traveler" : "hotel_manager"
    };
    if (userService.signin(user)) {
      window.history.go();
    } else {
      this.setState({ showModal: "signin_failed" });
    }
  }

  signup = (e) => {
    e.preventDefault();
    const signup = this.state.signup;
    const user = {
      username: signup.username,
      password: signup.password,
      first_name: signup.first_name,
      last_name: signup.last_name,
      gender: signup.gender,
      date_of_birth: signup.date_of_birth,
      email: signup.email,
      phone_num: signup.phone_num,
      user_type: this.props.type === "Traveler" ? "traveler" : "hotel_manager"
    };
    if (userService.signup(user)) {
      this.setState({ showModal: "signup_completed" });
    } else {
      this.setState({ showModal: "signup_failed" });
    }
  }

  render() {
    return (
      <>
        <CustomModal
          showModal={this.props.showModal}
          closeModal={() => {
            this.props.closeModal();
            this.setState({ active: "signin" });
          }}
          className="signin-signup"
          dialogClassName={this.state.showModal ? "d-none" : ""}
          header={
            <Col className="text-center"><h3><strong>{this.props.type}</strong></h3></Col>
          }
          body={
            <>
              <Row className="text-center">
                <Col xs={6}>
                  <div onClick={() => this.setState({ active: "signin" })} className={this.state.active === "signin" ? "active" : ""}>Sign in</div>
                </Col>
                <Col xs={6}>
                  <div onClick={() => this.setState({ active: "signup" })} className={this.state.active === "signup" ? "active" : ""}>Sign up</div>
                </Col>
              </Row>
              <hr />
              {this.state.active === "signin" ? this.getSigninForm() : this.getSignupForm()}
            </>
          }
          noFooter noCloseButton />
        <CustomModal
          showModal={this.state.showModal === "signup_completed"}
          closeModal={() => { this.setState({ showModal: null }); this.props.closeModal(); }}
          title="Sign up completed"
          body="Thank you for joining us. This account will be signed in automatically." />
        <CustomModal
          showModal={this.state.showModal === "signup_failed"}
          closeModal={() => this.setState({ showModal: null })}
          title="This username is taken"
          body="Please try again with another username." />
        <CustomModal
          showModal={this.state.showModal === "signin_failed"}
          closeModal={() => this.setState({ showModal: null })}
          title="Incorrect username or password"
          body="Please try again." />
      </>
    )
  }

  getSigninForm = () => {
    return (
      <Form onSubmit={this.signin} className="mx-5 my-5">
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => this.setState({ signin: { ...this.state.signin, username: e.currentTarget.value } })}
            placeholder="Username"
            required />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => this.setState({ signin: { ...this.state.signin, password: e.currentTarget.value } })}
            placeholder="Password"
            required />
        </Form.Group>
        <br />
        <div className="text-center">
          <Button variant="dark" type="submit">Sign in</Button>
        </div>
      </Form>
    )
  }

  getSignupForm = () => {
    return (
      <Form onSubmit={this.signup} className="mx-2">
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, username: e.currentTarget.value } })}
              placeholder="Username"
              required />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, password: e.currentTarget.value } })}
              placeholder="Password"
              required />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>First name</Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, first_name: e.currentTarget.value } })}
              placeholder="First name"
              required />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Last name</Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, last_name: e.currentTarget.value } })}
              placeholder="Last name"
              required />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} md={6}>
            <Form.Label>Gender</Form.Label>
            <Form.Control as="select" onChange={(e) => this.setState({ signup: { ...this.state.signup, gender: e.currentTarget.value } })}>
              <option>Not specified</option>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} md={6}>
            <Form.Label>Date of birth</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, date_of_birth: e.currentTarget.value } })}
              placeholder="Date of birth"
              required />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, email: e.currentTarget.value } })}
              placeholder="Email"
              required />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, phone_num: e.currentTarget.value } })}
              placeholder="Phone"
              required />
          </Form.Group>
        </Form.Row>
        <br />
        <div className="text-center">
          <Button variant="dark" type="submit">Sign up</Button>
        </div>
      </Form>
    )
  }
}