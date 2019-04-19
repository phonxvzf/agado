import React, { Component } from 'react';
import { Col, Row, Image, Button, ProgressBar } from 'react-bootstrap';
import qs from 'qs';
import '../css/HotelInfo.css';

import ReviewModal from '../component/ReviewModal';
import RoomSelection from '../component/RoomSelection';
import CustomModal from '../component/CustomModal';

import { userService } from '../service/userService';
import { reviewService } from '../service/reviewService';
import { hotelService } from '../service/hotelService';
import { requestService } from '../service/requestService';
import CreateHotel from './CreateHotel';

export default class HotelInfo extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let oldReview = null;
    if (currentUser) {
      oldReview = reviewService.getOldReview(currentUser.uid, search.hid);
    }
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      oldReview: oldReview
    });

    let hotel = {
      hid: 1,
      name: "New York Skyline Hotel",
      city: "New York",
      address: "1/3 Moo 6, Thanarat Road, Moo Si, Pakchong, Khao Yai National Park, Khao Yai, Thailand, 30130",
      desc: "Take a look at New York view, the best way to see this city. You will find all the classic buildings, sights and more plus. Bootstrap includes a few general use CSS transitions that can be applied to a number of components. Add a collapse toggle animation to an element or component.",
      rating: 2.7,
      review: 134,
      price: 75,
      roomLeft: 26,
      reviews: [84, 32, 2, 11, 5],
      imgs: ['/image/hotel2-1.jpg',
        '/image/hotel2-2.jpg',
        '/image/hotel2-3.jpg',
        '/image/hotel2-4.jpg',
        '/image/hotel2-5.jpg',
        '/image/hotel1.jpg'],
      managers: [1, 2, 4]
    };

    const r = reviewService.getHotelReviews(search.hid);
    let h = hotelService.getHotel(search.hid);
    if (h) {
      h.rating = r.length > 0 ? (r.map(review => review.rating).reduce((a, b) => a + b, 0)) / r.length : 0;
      h.review = r.length;
      h.reviews = [0, 0, 0, 0, 0]
      r.forEach(review => h.reviews[5 - review.rating] = h.reviews[5 - review.rating] + 1);
      h.price = h.rooms.map(room => room.price).reduce((a, b) => Math.min(a, b), 0);
      h.roomLeft = h.rooms.map(room => room.availableRoom).reduce((a, b) => a + b, 0);
      hotel = h;
    }

    this.setState({
      hotel: hotel,
      reviews: r
    });
  }

  getProfileLink = (uid) => {
    const pathname = "/profile";
    const search = qs.stringify({
      uid: uid
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  requestPermission = () => {
    const request = {
      hid: this.state.search.hid,
      uid: this.state.currentUser.uid
    }
    if (requestService.createRequest(request)) {
      window.history.go();
    }
  }

  isUserOwn = () => {
    return this.state.currentUser && this.state.currentUser.user_type === "hotel_manager" && this.state.hotel.managers.includes(this.state.currentUser.uid);
  }

  render() {
    return (
      <>
        <div className="hotel-bg px-auto hotel-info">
          {
            this.props.mode === "edit" && this.isUserOwn() ?
              <CreateHotel />
              :
              <>
                {this.getImageSection()}
                <div className="px-content" id="hotel_info">
                  {this.getInfoSection()}
                </div>
                <div id="hotel_rooms">
                  <RoomSelection />
                </div>
              </>
          }
          <div className="px-content" id="hotel_reviews">
            {this.getReviewsSection()}
          </div>
          <div className="px-content" id="hotel_managers">
            {this.getManagersSection()}
          </div>
        </div>
        <ReviewModal
          hid={this.state.search.hid}
          oldReview={this.state.oldReview}
          showModal={this.state.showModal === "review"}
          closeModal={() => this.setState({ showModal: null })} />
        <CustomModal
          showModal={this.state.showModal === "request_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Please confirm to request permission"
          body="The request will be sent to the hotel managers of this hotel. You will can manage this hotel after the they accept the permission"
          footer={
            <Button variant="success" onClick={this.requestPermission}>Confirm</Button>
          } />
      </>
    )
  }

  getImageSection = () => {
    const hotel = this.state.hotel;
    return (
      <Row className="shadow scroll-snap-child" noGutters>
        <Col xs={12} sm={6}>
          <div className="ratio4-3">
            {
              hotel.imgs[0] === "" ?
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
                  hotel.imgs[1] === "" ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[1]} fluid />
                }
              </div>
            </Col>
            <Col>
              <div className="ratio4-3">
                {
                  hotel.imgs[2] === "" ?
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
                  hotel.imgs[3] === "" ?
                    <div className="bg-dark abs-center border-none" />
                    : <Image className="absolute" src={hotel.imgs[3]} fluid />
                }
              </div>
            </Col>
            <Col>
              <div className="ratio4-3">
                {
                  hotel.imgs[4] === "" ?
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

  getInfoSection = () => {
    const hotel = this.state.hotel;
    return (
      <>
        <h3 className="mt-5 scroll-snap-child">{hotel.name}</h3>
        <h5>{hotel.city}</h5>
        <hr />
        <Row className="align-items-center mt-3" noGutters>
          <div className="fs-18"><i className="fas fa-map-marker-alt" /> {hotel.address}</div>
        </Row>
        <Row className="align-items-center mt-3" noGutters>
          <div className="fs-18"><i className="fas fa-file-alt" /> {hotel.desc}</div>
        </Row>
        {
          !this.state.currentUser || this.state.currentUser.user_type === "traveler" || this.isUserOwn() ? "" :
            <>
              <hr className="mb-4" />
              <Row className="align-items-center mb-4" noGutters>
                <Col className="text-center">
                  {
                    requestService.isRequestPending(this.state.search.hid, this.state.currentUser.uid) ?
                      <Button disabled variant="dark" className="bg-requestpx-4">
                        <i className="fas fa-paper-plane" /> Request is pending
                          </Button>
                      :
                      <Button variant="dark" className="bg-requestpx-4" onClick={() => this.setState({ showModal: "request_confirm" })}>
                        <i className="fas fa-file-export" /> Request permission
                          </Button>
                  }
                </Col>
              </Row>
            </>
        }
        <hr className="mb-5" />
      </>
    )
  }

  getReviewsSection = () => {
    const hotel = this.state.hotel;
    return (
      <>
        <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
          <h3>{"Ratings & Reviews"}</h3>
        </Row>
        <Row className="align-items-center mt-3" noGutters>
          <Col lg={1} className="d-xs-none" />
          <Col xs={2} className="text-center">
            <h2>{hotel.rating.toFixed(1)}</h2>
            out of 5
            </Col>
          <Col>
            {hotel.reviews.map((review, idx) => this.getProgressComponent(review, idx))}
          </Col>
          <Col lg={1} className="d-xs-none" />
        </Row>
        <Row className="align-items-center mt-3" noGutters>
          <Col className="text-center">
            <Button variant="info" className="px-4" onClick={() => this.setState({ showModal: "review" })}>
              {this.state.oldReview ? "Edit old review" : "Write a review"}
            </Button>
          </Col>
        </Row>
        {this.getReviewsComponent()}
        <hr className="mb-5" />
      </>
    )
  }

  getProgressComponent = (review, idx) => {
    return (
      <Row className="align-items-center" noGutters key={idx}>
        <Col xs={4} sm={3} xl={2} className="text-right fs-stars mr-md-3">
          {this.getStarComponent(idx)}
        </Col>
        <Col>
          <ProgressBar variant="dark" className="progress-star" now={review * 100 / this.state.hotel.review} />
        </Col>
      </Row>
    )
  }

  getStarComponent = (idx) => {
    let stars = [];
    for (let i = 0; i < 5 - idx; ++i) {
      const star = <i className="fas fa-star mr-1" key={i} />;
      stars.push(star);
    }
    return stars;
  }

  getReviewsComponent = () => {
    return this.state.reviews.map(review => {
      const user = userService.getUser(review.uid);
      return (
        <>
          <hr className="my-2" />
          <Row className="align-items-center scroll-snap-child">
            <Col xs={12} sm={4} md={3} lg={2} className="text-center">
              <a className="text-dark" href={this.getProfileLink(user.uid)}>
                <div className="w-xs-25 w-sm-50">
                  <div className="circle-avatar w-100 my-2" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                </div>
                {this.state.currentUser && "" + this.state.currentUser.uid === "" + user.uid ? <strong>Me</strong> : user.first_name + " " + user.last_name}
              </a>
            </Col>
            <Col xs={12} sm={8} md={9} lg={10}>
              <h5>{review.title}</h5>
              <div className="fs-14">{this.getRatingStar(review.rating)} {new Date(review.date).toLocaleDateString()}</div>
              {review.comment}
            </Col>
          </Row>
        </>
      )
    })
  }

  getRatingStar = (rating) => {
    rating = Math.round(rating * 2) / 2;

    let ratingStar = [];
    let key = 1;

    for (let i = 0; i < rating - 0.5; ++i) {
      const star = <i className="fas fa-star" key={key++} />;
      ratingStar.push(star);
    }
    if (rating % 1 !== 0) {
      const halfStar = <i className="fas fa-star-half-alt" key={key++} />;
      ratingStar.push(halfStar);
      rating += 0.5;
    }
    for (let i = 0; i < 5 - rating; ++i) {
      const emptyStar = <i className="far fa-star" key={key++} />;
      ratingStar.push(emptyStar);
    }
    return ratingStar;
  }

  getManagersSection = () => {
    const hotel = this.state.hotel;
    return (
      <>
        <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
          <h3>Managers</h3>
        </Row>
        <Row>
          {
            hotel.managers.map(uid => {
              const user = userService.getUser(uid);
              return (
                <Col xs={12} sm={6} md={4} lg={4} className="my-3">
                  <a className="text-dark" href={this.getProfileLink(user.uid)}>
                    <Row className="align-items-center">
                      <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                      <Col>{this.state.currentUser && "" + this.state.currentUser.uid === "" + user.uid ? <strong>Me</strong> : user.first_name + " " + user.last_name}</Col>
                    </Row>
                  </a>
                </Col>
              )
            })
          }
        </Row>
        <hr className="mb-5" />
      </>
    );
  }
}
