import React, { Component } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import qs from 'qs';

import CustomModal from '../component/CustomModal';

import { userService } from '../service/userService';

import '../css/Profile.css';
import { reviewService } from '../service/reviewService';
import { hotelService } from '../service/hotelService';
import HotelManageCard from '../component/HotelManageCard';
import HotelCard from '../component/HotelCard';

export default class Profile extends Component {
  state = {
    mode: ""
  }

  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      pathname: pathname,
      search: search
    });

    const user = userService.getUser(search.uid);
    const currentUser = userService.getCurrentUser();

    this.setState({
      user: user,
      currentUser: currentUser,
      editedUser: currentUser
    });
  }

  getImgUrl = (img) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(img);
    });
  }

  uploadImg = (e) => {
    const img = e.currentTarget.files[0];
    this.setState({ imgName: img.name });
    this.getImgUrl(img).then(imgUrl => {
      this.setState({ editedUser: { ...this.state.editedUser, img: imgUrl } });
    });
  }

  editUserInfo = (e) => {
    e.preventDefault();
    const editedUser = this.state.editedUser;
    const user = {
      uid: editedUser.uid,
      first_name: editedUser.first_name,
      last_name: editedUser.last_name,
      gender: editedUser.gender,
      email: editedUser.email,
      phone_num: editedUser.phone_num,
      date_of_birth: editedUser.date_of_birth,
      img: editedUser.img
    };
    if (userService.editUserInfo(user)) {
      this.setState({
        user: user,
        showModal: "save_completed",
        mode: ""
      });
    } else {
      this.setState({ showModal: "save_failed" });
    }
  }

  deleteAccount = (e) => {
    e.preventDefault();
    if (userService.deleteUser(this.state.currentUser.uid)) {
      // this.setState({ showModal: "delete_completed" });
      userService.signout()
    }
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
    if (!this.state.user) {
      return (
        <div className="hotel-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      )
    }
    return (
      <>
        <div className="profile-bg scroll-snap-child">
          {
            this.state.mode === "" ? this.getUserInfoComponent() :
              this.state.mode === "edit" ? this.getEditUserComponent() : ""
          }
          <hr />
          {
            this.state.user.user_type === "traveler" ? this.getPreviousReviews() :
              this.getHotelsManaged()
          }
        </div>
        <CustomModal
          showModal={this.state.showModal === "save_completed"}
          closeModal={() => window.history.go()}
          title="Save completed"
          body="Your profile was changed." />
        <CustomModal
          showModal={this.state.showModal === "save_failed"}
          closeModal={() => this.setState({ showModal: null })}
          title="Permission denied"
          body="Your accunt is not exist in the database." />
        <CustomModal
          showModal={this.state.showModal === "delete_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Are you sure to delete this account?"
          body="Your account will be gone forever. You will not be able to revert this."
          footer={
            <Button variant="danger" onClick={this.deleteAccount}>Yes, delete it!</Button>
          } />
        <CustomModal
          showModal={this.state.showModal === "delete_completed"}
          closeModal={() => userService.signout()}
          title="Delete completed"
          body="Your accunt will not be able to access anymore. You will be signed out automatically." />
      </>
    )
  }

  getUserInfoComponent = () => {
    const user = this.state.user;
    const currentUser = this.state.currentUser;
    return (
      <Row className="align-items-center justify-content-center">
        <Col xs={12} sm={4} className="text-center">
          <div className="circle-avatar w-50" style={user.img ? { backgroundImage: `url(${user.img})` } : { backgroundColor: userService.getUserColor(user.username) }} />
          <br />
          <h4><strong>{user.first_name} {user.last_name}</strong></h4>
          <h6>{user.user_type === "traveler" ? "Traveler" : "Hotel manager"}</h6>
        </Col>
        <Col xs={10} sm={7}>
          <hr className="d-sm-none" />
          <Row className="align-items-center" noGutters>
            <Col xs={4} sm={4} md={3} xl={2} as="h6"><strong>Gender:</strong></Col>
            <Col as="h6">{user.gender}</Col>
          </Row>
          <Row className="align-items-center" noGutters>
            <Col xs={4} sm={4} md={3} xl={2} as="h6"><strong>Birth date:</strong></Col>
            <Col as="h6">{new Date(user.date_of_birth).toLocaleDateString()}</Col>
          </Row>
          <Row className="align-items-center" noGutters>
            <Col xs={4} sm={4} md={3} xl={2} as="h6"><strong>Email:</strong></Col>
            <Col as="h6">{user.email}</Col>
          </Row>
          <Row className="align-items-center" noGutters>
            <Col xs={4} sm={4} md={3} xl={2} as="h6"><strong>Tel:</strong></Col>
            <Col as="h6">{user.phone_num}</Col>
          </Row>
          {
            "" + currentUser.uid !== "" + this.state.search.uid ? "" :
              <>
                <Button variant="success" className="mr-4 my-2" onClick={() => this.setState({ mode: "edit" })}>Edit profile</Button>
                <Button variant="danger" className="my-2" onClick={() => this.setState({ showModal: "delete_confirm" })}>Delete account</Button>
              </>
          }
        </Col>
      </Row>
    )
  }

  getEditUserComponent = () => {
    const editedUser = this.state.editedUser;
    return (
      <Row className="align-items-center justify-content-center">
        <Col xs={12} sm={4} className="text-center">
          <div className="circle-avatar w-50" style={editedUser.img ? { backgroundImage: `url(${editedUser.img})` } : { backgroundColor: userService.getUserColor(editedUser.username) }} />
          <br />
          <div>
            <Form className="custom-file w-75">
              <Form.Control type="file" className="custom-file-input" onChange={this.uploadImg} />
              <Form.Label className="custom-file-label text-left">{this.state.imgName ? this.state.imgName : "Choose file"}</Form.Label>
            </Form>
          </div>
        </Col>
        <Col xs={10} sm={7}>
          <hr className="d-sm-none" />
          <Form onSubmit={this.editUserInfo}>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>First name:</strong></Col>
              <Col as="h6">
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, first_name: e.currentTarget.value } })}
                  placeholder="First name"
                  defaultValue={editedUser.first_name}
                  required />
              </Col>
            </Row>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>Last name:</strong></Col>
              <Col as="h6">
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, last_name: e.currentTarget.value } })}
                  placeholder="Last name"
                  defaultValue={editedUser.last_name}
                  required />
              </Col>
            </Row>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>Gender:</strong></Col>
              <Col as="h6">
                <Form.Control
                  as="select"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, gender: e.currentTarget.value } })}
                  defaultValue={editedUser.gender}
                  required>
                  <option>Not specified</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </Form.Control>
              </Col>
            </Row>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>Birth date:</strong></Col>
              <Col xs={7} sm={8} md={9} xl={10} as="h6">
                <Form.Control
                  type="date"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, date_of_birth: e.currentTarget.value } })}
                  defaultValue={editedUser.date_of_birth}
                  required />
              </Col>
            </Row>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>Email:</strong></Col>
              <Col as="h6">
                <Form.Control
                  type="email"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, email: e.currentTarget.value } })}
                  placeholder="Email"
                  defaultValue={editedUser.email}
                  required />
              </Col>
            </Row>
            <Row className="align-items-center" noGutters>
              <Col xs={5} sm={4} md={3} xl={2} as="h6"><strong>Tel:</strong></Col>
              <Col as="h6">
                <Form.Control
                  type="tel"
                  onChange={(e) => this.setState({ editedUser: { ...editedUser, phone_num: e.currentTarget.value } })}
                  placeholder="Phone"
                  defaultValue={editedUser.phone_num}
                  required />
              </Col>
            </Row>
            {
              "" + editedUser.uid !== "" + this.state.search.uid ? "" :
                <>
                  <Button type="submit" variant="success" className="mr-4 my-2">Save changes</Button>
                  <Button variant="secondary" className="my-2" onClick={() => this.setState({ mode: "" })}>Cancel</Button>
                </>
            }
          </Form>
        </Col>
      </Row>
    )
  }

  getPreviousReviews = () => {
    const reviews = reviewService.getReviewsOf(this.state.user.uid);
    const user = this.state.user;
    if (reviews.length === 0) {
      return;
    }
    return (
      <div className="px-content">
        <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
          <h3>Review's history</h3>
        </Row>
        {
          reviews.map(review => {
            const hotel = hotelService.getHotel(review.hid);
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
                    <h5 className="d-inline">{review.title} </h5>
                    <a className="fs-14 text-dark" href={this.getHotelLink(hotel.hid)}>@{hotel.name}</a>
                    <div className="fs-14">{this.getRatingStar(review.rating)} {new Date(review.date).toLocaleDateString()}</div>
                    {review.comment}
                  </Col>
                </Row>
              </>
            )
          })
        }
        <hr className="mb-5" />
      </div>
    )
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

  getHotelsManaged = () => {
    let hotels = hotelService.getHotelOf(this.state.user.uid);
    hotels = hotels.map(hotel => {
      const reviews = reviewService.getHotelReviews(hotel.hid);
      hotel.review = reviews.length;
      hotel.rating = reviews.length <= 0 ? 0 :
        (reviews.map(review => review.rating).reduce((a, b) => a + b, 0)) / reviews.length;
      hotel.price = hotel.rooms.map(room => room.price).reduce((a, b) => Math.min(a, b), Infinity);
      hotel.price = hotel.price === Infinity ? 0 : hotel.price;
      hotel.roomLeft = hotel.rooms.map(room => room.availableRoom).reduce((a, b) => a + b, 0);
      return hotel
    })
    return (
      <div className="px-content">
        <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
          <h3>Hotels managed</h3>
        </Row>
        <Row>
          {
            hotels.map(hotel => {
              return (
                <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hid}>
                  <HotelCard hotel={hotel} />
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
