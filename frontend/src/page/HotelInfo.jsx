import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Image, ProgressBar, Row } from 'react-bootstrap';
import CustomModal from '../component/CustomModal';
import ReviewModal from '../component/ReviewModal';
import RoomSelection from '../component/RoomSelection';
import '../css/HotelInfo.css';
import { hotelService } from '../service/hotelService';
import { requestService } from '../service/requestService';
import { reviewService } from '../service/reviewService';
import { userService } from '../service/userService';
import CreateHotel from './CreateHotel';

export default class HotelInfo extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let oldReview = null;
    let isRequestPending = false;
    if (currentUser) {
      oldReview = await reviewService.getOldReview(Number(search.hotel_id));
      isRequestPending = await requestService.isRequestPending(Number(search.hotel_id), currentUser.user_id);
    }
    const hotel = await hotelService.getHotel(Number(search.hotel_id), search.checkin, search.checkout);
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      hotel: hotel,
      oldReview: oldReview,
      isRequestPending: isRequestPending
    });
  }

  getProfileLink = (user_id) => {
    const pathname = "/profile";
    const search = qs.stringify({
      user_id: user_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  requestPermission = async () => {
    const request = {
      hotel_id: Number(this.state.search.hotel_id),
      user_id: this.state.currentUser.user_id
    }
    if (await requestService.createRequest(request)) {
      window.history.go();
    }
  }

  isUserOwn = () => {
    return this.state.currentUser && this.state.currentUser.user_type === "hotel_manager" && this.state.hotel.managers.includes(this.state.currentUser.user_id);
  }

  render() {
    if (!this.state) {
      return <div className="error-bg scroll-snap-child" />
    } else if (!this.state.hotel) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      )
    }
    return (
      <>
        <div className="hotel-bg px-auto hotel-info">
          {
            this.props.mode === "edit" && this.isUserOwn() ?
              <CreateHotel pathname={this.state.pathname} search={this.state.search} currentUser={this.state.currentUser} hotel={this.state.hotel} setPreventLeavePage={this.props.setPreventLeavePage} />
              :
              <>
                <div id="hotel_info">
                  {this.getImageSection()}
                </div>
                <div className="px-content">
                  {this.getInfoSection()}
                </div>
                <div id="hotel_rooms">
                  {
                    <RoomSelection search={this.state.search} currentUser={this.state.currentUser} rooms={this.state.hotel.rooms} />
                  }
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
          hotel_id={Number(this.state.search.hotel_id)}
          checkin={this.state.search.checkin}
          checkout={this.state.search.checkout}
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
      <div className="break-all-word">
        <h2 className="mt-5 scroll-snap-child">{hotel.name}</h2>
        <h4 className="">{hotel.city}</h4>
        <hr />
        <Row className="align-items-center mt-3" noGutters>
          <div className="fs-18"><i className="fas fa-map-marker-alt" /> {hotel.address}</div>
        </Row>
        <Row className="align-items-center mt-3" noGutters>
          <div className="fs-18 break-all-word"><i className="fas fa-file-alt" /> {hotel.desc}</div>
        </Row>
        {
          !this.state.currentUser || this.state.currentUser.user_type === "traveler" || this.isUserOwn() ? "" :
            <>
              <hr className="mb-4" />
              <Row className="align-items-center mb-4" noGutters>
                <Col className="text-center">
                  {
                    this.state.isRequestPending ?
                      <Button disabled variant="secondary" className="bg-requestpx-4">
                        <i className="fas fa-paper-plane" /> Request is pending
                          </Button>
                      :
                      <Button variant="success" className="bg-requestpx-4" onClick={() => this.setState({ showModal: "request_confirm" })}>
                        <i className="fas fa-file-export" /> Request permission
                          </Button>
                  }
                </Col>
              </Row>
            </>
        }
        <hr className="mb-5" />
      </div>
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
            {this.getProgressComponent(hotel.num_rating5, 5)}
            {this.getProgressComponent(hotel.num_rating4, 4)}
            {this.getProgressComponent(hotel.num_rating3, 3)}
            {this.getProgressComponent(hotel.num_rating2, 2)}
            {this.getProgressComponent(hotel.num_rating1, 1)}
          </Col>
          <Col lg={1} className="d-xs-none" />
        </Row>
        <Row className="align-items-center mt-3" noGutters>
          <Col className="text-center">
            {
              !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                <Button variant="info" className="px-4" onClick={() => this.setState({ showModal: "review" })}>
                  {this.state.oldReview ? "Edit review" : "Write a review"}
                </Button>
                : ""
            }
          </Col>
        </Row>
        {this.getReviewsComponent()}
        <hr className="mb-5" />
      </>
    )
  }

  getProgressComponent = (num_rating, rating) => {
    return (
      <Row className="align-items-center" noGutters key={rating}>
        <Col xs={4} sm={3} xl={2} className="text-right fs-stars mr-md-3">
          {this.getStarComponent(rating)}
        </Col>
        <Col>
          <ProgressBar variant="dark" className="progress-star" now={num_rating * 100 / this.state.hotel.total_review} />
        </Col>
      </Row>
    )
  }

  getStarComponent = (rating) => {
    let stars = [];
    for (let i = 0; i < rating; ++i) {
      const star = <i className="fas fa-star mr-1" key={i} />;
      stars.push(star);
    }
    return stars;
  }

  getReviewsComponent = () => {
    return this.state.hotel.reviews.map(review => {
      const user = review.user;
      if (!user) return <></>;
      return (
        <>
          <hr className="my-2" />
          <Row className="align-items-center scroll-snap-child">
            <Col xs={12} sm={4} md={3} lg={2} className="text-center">
              <a className="text-dark" href={this.getProfileLink(user.user_id)}>
                <div className="w-xs-25 w-sm-50">
                  <div className="circle-avatar w-100 my-2" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                </div>
                {this.state.currentUser && "" + this.state.currentUser.user_id === "" + user.user_id ? <strong>Me</strong> : user.first_name + " " + user.last_name}
              </a>
            </Col>
            <Col xs={12} sm={8} md={9} lg={10}>
              <h5>{review.title}</h5>
              <div className="fs-14">{this.getRatingStar(review.rating)} {moment(review.date).format("D MMM YYYY")}</div>
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
            hotel.managers_info.map(user => {
              if (!user) return <></>;
              return (
                <Col xs={12} sm={6} md={4} lg={4} className="my-3">
                  <a className="text-dark" href={this.getProfileLink(user.user_id)}>
                    <Row className="align-items-center">
                      <div className="d-inline-block circle-avatar w-25" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
                      <Col>{this.state.currentUser && "" + this.state.currentUser.user_id === "" + user.user_id ? <strong>Me</strong> : user.first_name + " " + user.last_name}</Col>
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
