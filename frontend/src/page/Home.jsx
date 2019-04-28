import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import '../css/Home.css';
import { userService } from '../service/userService';

export default class Home extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser
    });

    if (currentUser && currentUser.user_type === "hotel_manager") {
      window.location.href = "/myhotel";
    }
  }

  getSearchLink = () => {
    const pathname = "/search";
    const search = qs.stringify({
      hotel_name: this.state.search.hotel_name
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    return (
      <div className="home-bg vertical-center text-center scroll-snap-child">
        <Container>
          <Row>
            <Col className="text-center">
              <div className="title">
                Choose your destination
              </div>
            </Col>
          </Row>
          <Form onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
            <Row className="justify-content-center">
              <Col xs={11} sm={11} md={9} lg={8} xl={7} className="my-2">
                <InputGroup className="shadow">
                  <Form.Control
                    className="not-form-control"
                    type="search"
                    onChange={(e) => this.setState({ search: { ...this.state.search, hotel_name: e.currentTarget.value } })}
                    placeholder={!this.state.currentUser || this.state.currentUser.user_type === "traveler" ? "Hotel or Destination" : "Find hotels"}
                    autoFocus />
                  <InputGroup.Append>
                    <Button type="submit" variant="light" tabIndex={-1}><i className="fas fa-search" /></Button>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    )
  }
}
