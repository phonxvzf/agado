import qs from 'qs';
import React, { Component } from 'react';
import { Button, Card, Col, Image, Row } from 'react-bootstrap';
import { hotelService } from '../service/hotelService';
import { requestService } from '../service/requestService';
import { userService } from '../service/userService';

export default class Request extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();

    let requests = [];
    if (currentUser) {
      requests = await requestService.getRequestOf();
      
      requests = await requests.reduce(async (prev, request) => {
        let r = await prev;
        request.user = await userService.getUser(request.user_id);
        const requests = r[request.hotel_id] ? r[request.hotel_id].requests : [];
        r[request.hotel_id] = {
          requests: requests.concat(request)
        };
        return r;
      }, Promise.resolve({}));

      let temp = [];
      for (const hotel_id in requests) {
        requests[hotel_id].hotel = await hotelService.getHotel(hotel_id);
        temp.push(requests[hotel_id]);
      }
      requests = temp;
    }

    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      validUser: currentUser && currentUser.user_type === "hotel_manager",
      requests: requests
    });
  }

  getProfileLink = (user_id) => {
    const pathname = "/profile";
    const search = qs.stringify({
      user_id: user_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelLink = (hotel_id) => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hotel_id: hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    if (!this.state) {
      return <div className="error-bg scroll-snap-child" />
    } else if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    }
    const requests = this.state.requests;
    return (
      requests.length === 0 ?
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h4>You have no requests at this time.</h4>
        </div>
        :
        <div className="hotel-bg px-auto hotel-info">
          {
            requests.map(request => {
              if (!request) return <></>;
              const hotel = request.hotel;
              return (
                <div className="px-content scroll-snap-child mb-5">
                  <div className="px-content">
                    <Card>
                      <Card.Header>
                        <Row className="align-items-center justify-content-center">
                          <a className="text-dark" href={this.getHotelLink(hotel.hotel_id)}>
                            <h4 className="mr-md-4 my-2 bold">{hotel.name}</h4>
                          </a>
                          {/* <Button variant="info" className="my-2" href={this.getHotelLink(hotel.hotel_id)}>View hotel</Button> */}
                        </Row>
                        {/* {this.getHotelImages(hotel)} */}
                      </Card.Header>
                      <Card.Body>
                        {
                          request.requests.map((r, idx) => {
                            const user = r.user;
                            return (
                              <>
                                {idx > 0 ? <hr /> : ""}
                                <Row className="align-items-center justify-content-center my-3">
                                  <Col xs={10} md={4}>
                                    <a className="text-dark" href={this.getProfileLink(user.user_id)}>
                                      <Row className="align-items-center">
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
                                  </Col>
                                  <Col xs={4} md={2} className="my-3">
                                    <Button variant="success" onClick={() => requestService.acceptRequest(r.request_id, r.hotel_id, r.user_id)}>Accept</Button>
                                  </Col>
                                  <Col xs={4} md={2} className="my-3">
                                    <Button variant="danger" onClick={() => requestService.rejectRequest(r.request_id)}>Reject</Button>
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
        </div>
    )
  }

  getHotelImages = (hotel) => {
    return (
      <Row className="shadow scroll-snap-child" noGutters>
        <Col xs={12} sm={6}>
          <div className="ratio4-3">
            {
              !hotel.imgs[0] ?
                <div className="bg-dark abs-center border-none" />
                : <Image className="absolute" src={hotel.imgs[0]} fluid />
            }
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <Row noGutters>
            <Col>
              <div className="ratio4-3">
                {
                  !hotel.imgs[1] ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[1]} fluid />
                }
              </div>
            </Col>
            <Col>
              <div className="ratio4-3">
                {
                  !hotel.imgs[2] ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[2]} fluid />
                }
              </div>
            </Col>
          </Row>
          <Row noGutters>
            <Col>
              <div className="ratio4-3">
                {
                  !hotel.imgs[3] ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[3]} fluid />
                }
              </div>
            </Col>
            <Col>
              <div className="ratio4-3">
                {
                  !hotel.imgs[4] ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[4]} fluid />
                }
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}
