import moment from 'moment';
import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import '../css/SigninSignupModal.css';
import { userService } from '../service/userService';
import CustomModal from './CustomModal';

export default class SigninSignupModal extends Component {
  state = {
    active: "signin",
    showModal: null,
    signup: {
      date_of_birth: moment().month(0).date(1)
    }
  }

  signin = async (e) => {
    e.preventDefault();
    const signin = this.state.signin;
    const user = {
      username: signin.username,
      password: signin.password,
      user_type: this.props.type === "Traveler" ? "traveler" : "hotel_manager"
    };
    if (await userService.signin(user)) {
      if (user.user_type === "traveler") {
        window.history.go();
      } else if (user.user_type === "hotel_manager") {
        window.location.href = "/myhotel";
      }
    } else {
      this.setState({ showModal: "signin_failed" });
    }
  }

  signup = async (e) => {
    e.preventDefault();
    const signup = this.state.signup;
    const user = {
      username: signup.username,
      password: signup.password,
      first_name: signup.first_name,
      last_name: signup.last_name,
      gender: signup.gender ? signup.gender : "Not specified",
      date_of_birth: moment(signup.date_of_birth).format('YYYY-MM-DD'),
      email: signup.email,
      phone_num: signup.phone_num,
      user_type: this.props.type === "Traveler" ? "traveler" : "hotel_manager"
    };
    if (await userService.signup(user)) {
      this.setState({ showModal: "signup_completed" });
    } else {
      this.setState({ showModal: "signup_failed" });
    }
  }

  changeBirthDate = (value, type) => {
    let date = moment(this.state.signup.date_of_birth);
    if (type === "day") {
      date.date(value);
    } else if (type === "month") {
      date.month(value);
    } else if (type === "year") {
      date.year(value);
    }
    if (date >= moment()) {
      this.setState({
        showModal: "invalid_date_of_birth"
      });
      return;
    }
    this.setState({
      signup: {
        ...this.state.signup,
        date_of_birth: date
      }
    })
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
                  <Button variant="link" onClick={() => this.setState({ active: "signin" })} className={"text-secondary bold" + (this.state.active === "signin" ? " active" : "")}>Sign in</Button>
                </Col>
                <Col xs={6}>
                  <Button variant="link" onClick={() => this.setState({ active: "signup" })} className={"text-secondary bold" + (this.state.active === "signup" ? " active" : "")}>Sign up</Button>
                </Col>
              </Row>
              <hr />
              {this.state.active === "signin" ? this.getSigninForm() : this.getSignupForm()}
            </>
          }
          noFooter noCloseButton />
        <CustomModal
          showModal={this.state.showModal === "signup_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Please confirm to signup"
          body="Your account will be stored in our system. You will be signed in automatically."
          footer={
            <Button variant="success" onClick={this.signup}>Confirm</Button>
          } />
        <CustomModal
          showModal={this.state.showModal === "signup_completed"}
          closeModal={() => this.props.type === "Traveler" ? window.history.go() : window.location.href = "/myhotel"}
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
        <CustomModal
          showModal={this.state.showModal === "invalid_date_of_birth"}
          closeModal={() => this.setState({ showModal: null })}
          title="Invlid date of birth"
          body="The date must be in the past." />
      </>
    )
  }

  getSigninForm = () => {
    return (
      <Form validated onSubmit={this.signin} className="mx-5 my-5">
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            minLength={4}
            maxLength={12}
            type="text"
            onChange={(e) => this.setState({ signin: { ...this.state.signin, username: e.currentTarget.value } })}
            placeholder="Username"
            required />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            minLength={4}
            maxLength={12}
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
      <Form validated onSubmit={(e) => { e.preventDefault(); this.setState({ showModal: "signup_confirm" }); }} className="mx-2">
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Username</Form.Label>
            <Form.Control
              minLength={4}
              maxLength={12}
              type="text"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, username: e.currentTarget.value } })}
              placeholder="Username"
              required />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              minLength={4}
              maxLength={12}
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
            <Row noGutters>
              <Col xs={4} className="pr-2">
                <Form.Control as="select"
                  onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'day')}
                  value={moment(this.state.signup.date_of_birth).date()}>
                  {
                    Array(31).fill().map((_, i) => i + 1)
                      .map(day => <option>{day}</option>)
                  }
                </Form.Control>
              </Col>
              <Col xs={4} className="px-1">
                <Form.Control as="select"
                  onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'month')}
                  value={moment(this.state.signup.date_of_birth).format('MMM')}>
                  {
                    Array(12).fill().map((_, i) => moment().month(i).format('MMM'))
                      .map(month => <option>{month}</option>)
                  }
                </Form.Control>
              </Col>
              <Col xs={4} className="pl-2">
                <Form.Control as="select"
                  onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'year')}
                  value={moment(this.state.signup.date_of_birth).year()}>
                  {
                    Array(80).fill().map((_, i) => moment().year() - i)
                      .map(year => <option>{year}</option>)
                  }
                </Form.Control>
              </Col>
            </Row>
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
              pattern="^0[0-9]{9}$"
              type="tel"
              onChange={(e) => this.setState({ signup: { ...this.state.signup, phone_num: e.currentTarget.value } })}
              placeholder="Phone"
              required />
            <Form.Text className={"text-danger " + (!this.state.signup.phone_num || /^0[0-9]{9}$/.test(this.state.signup.phone_num) ? "d-none" : "")}>Format: 0 followed by 9 digits</Form.Text>
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