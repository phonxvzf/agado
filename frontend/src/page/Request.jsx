import React, { Component } from 'react';
import { Col, Row, Image, Button, Card } from 'react-bootstrap';
import qs from 'qs';

import { requestService } from '../service/requestService';
import { userService } from '../service/userService';
import { hotelService } from '../service/hotelService';

export default class Request extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();

    let requests = [];
    if (currentUser) {
      requests = requestService.getRequestOf(currentUser.uid).reduce((r, request) => {
        r[request.hid] = (r[request.hid] || []).concat(request);
        return r;
      }, []);
    }

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager",
      requests: requests
    });
  }

  getProfileLink = (uid) => {
    const pathname = "/profile";
    const search = qs.stringify({
      uid: uid
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelLink = (hid) => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hid: hid
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    if (!this.state.validUser) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    }
    const requests = this.state.requests;
    return (
      <div className="hotel-bg px-auto hotel-info">
        {
          requests.length === 0 ?
            <div className="scroll-snap-child">
              <h1>Request</h1>
              <h4>You have no requests at this time.</h4>
            </div>
            :
            <>
              {
                requests.map(request => {
                  if (!request) return;
                  const hotel = hotelService.getHotel(request[0].hid);
                  return (
                    <div className="px-content scroll-snap-child mb-5">
                      <div className="px-content">
                        <Card>
                          <Card.Header>
                            <Row className="align-items-center text-center justify-content-center">
                              <a className="text-dark" href={this.getHotelLink(hotel.hid)}>
                                <h4 className="mr-md-4 my-2">{hotel.name}</h4>
                              </a>
                              {/* <Button variant="info" className="my-2" href={this.getHotelLink(hotel.hid)}>View hotel</Button> */}
                            </Row>
                          </Card.Header>
                          {/* <hr /> */}
                          <Card.Body>
                            {
                              request.map((r, idx) => {
                                const user = userService.getUser(r.uid);
                                return (
                                  <>
                                    {idx > 0 ? <hr /> : ""}
                                    <Row className="align-items-center justify-content-center my-3">
                                      <Col xs={10} md={4}>
                                        <a className="text-dark" href={this.getProfileLink(user.uid)}>
                                          <Row className="align-items-center">
                                            <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                                            <Col>{this.state.currentUser && "" + this.state.currentUser.uid === "" + user.uid ? <strong>Me</strong> : user.first_name + " " + user.last_name}</Col>
                                          </Row>
                                        </a>
                                      </Col>
                                      <Col xs={4} md={2} className="my-3">
                                        <Button variant="success" onClick={() => requestService.acceptRequest(r.rid, r.hid, r.uid)}>Accept</Button>
                                      </Col>
                                      <Col xs={4} md={2} className="my-3">
                                        <Button variant="danger" onClick={() => requestService.rejectRequest(r.rid)}>Reject</Button>
                                      </Col>
                                    </Row>
                                  </>
                                )
                              })
                            }
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  )
                })
              }
            </>
        }
      </div>
    )
  }
}
