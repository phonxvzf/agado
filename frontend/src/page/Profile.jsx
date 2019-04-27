import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import CustomModal from '../component/CustomModal';
import HotelCard from '../component/HotelCard';
import HotelManageCard from '../component/HotelManageCard';
import '../css/Profile.css';
import { hotelService } from '../service/hotelService';
import { reviewService } from '../service/reviewService';
import { userService } from '../service/userService';

export default class Profile extends Component {
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const user = await userService.getUser(Number(search.user_id));
    const currentUser = userService.getCurrentUser();
    const hotels = user ? await hotelService.getHotelOf(user.user_id) : [];
    let reviews = user ? await reviewService.getReviewsOf(user.user_id) : [];
    reviews = await Promise.all(reviews.map(async review => {
      return {
        ...review,
        hotel: await hotelService.getHotel(review.hotel_id)
      };
    }));
    this.setState({
      pathname: pathname,
      search: search,
      user: user,
      currentUser: currentUser,
      editedUser: currentUser,
      hotels: hotels,
      reviews: reviews,
      mode: ""
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
    if (!img) {
      return;
    }
    if (!img.type.startsWith("image/")) {
      this.setState({
        showModal: "upload_not_img"
      })
      return;
    }
    if (img.size > 1e7) {
      this.setState({
        showModal: "upload_large_img"
      })
      return;
    }
    this.setState({ imgName: img.name });
    this.getImgUrl(img).then(imgUrl => {
      this.setState({ editedUser: { ...this.state.editedUser, img: imgUrl } });
    });
  }

  editUserInfo = async (e) => {
    e.preventDefault();
    const editedUser = this.state.editedUser;
    const user = {
      user_id: editedUser.user_id,
      first_name: editedUser.first_name,
      last_name: editedUser.last_name,
      gender: editedUser.gender,
      email: editedUser.email,
      phone_num: editedUser.phone_num,
      date_of_birth: editedUser.date_of_birth,
      img: editedUser.img
    };
    if (await userService.editUserInfo(editedUser)) {
      this.setState({
        user: user,
        showModal: "save_completed",
        mode: ""
      });
    } else {
      this.setState({ showModal: "save_failed" });
    }
  }

  deleteAccount = async (e) => {
    e.preventDefault();
    if (await userService.deleteUser()) {
      // this.setState({ showModal: "delete_completed" });
      userService.signout()
    }
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

  changeBirthDate = (value, type) => {
    let date = moment(this.state.editedUser.date_of_birth);
    if (type === "day") {
      date.date(value);
    } else if (type === "month") {
      date.month(value);
    } else if (type === "year") {
      date.year(value);
    }
    this.setState({
      editedUser: {
        ...this.state.editedUser,
        date_of_birth: date
      }
    })
  }

  render() {
    if (!this.state) {
      return <div className="error-bg scroll-snap-child" />
    }
    const user = this.state.user;
    if (!user) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>This page is not exist</h1>
        </div>
      );
    }
    return (
      <>
        <div className="profile-bg hotel-info scroll-snap-child">
          {
            !this.state.mode ? this.getUserInfoComponent() :
              this.state.mode === "edit" ? this.getEditUserComponent() : ""
          }
          <hr />
          {
            user.user_type === "traveler" ? this.getPreviousReviews() :
              this.getHotelsManaged()
          }
        </div>
        <CustomModal
          showModal={this.state.showModal === "save_completed"}
          closeModal={() => this.setState({ showModal: null })}
          title="Save completed"
          body="Your profile was changed." />
        <CustomModal
          showModal={this.state.showModal === "save_failed"}
          closeModal={() => this.setState({ showModal: null })}
          title="Permission denied"
          body="Your account does not exist in the system." />
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
        <CustomModal
          showModal={this.state.showModal === "upload_not_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="This file is not an image. " />
        <CustomModal
          showModal={this.state.showModal === "upload_large_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="The file size exceeds the limit of 10 MB." />
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
            <Col as="h6">{moment(user.date_of_birth).format("D MMM YYYY")}</Col>
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
            !currentUser || "" + currentUser.user_id !== "" + Number(this.state.search.user_id) ? "" :
              <>
                <Button variant="info" className="mr-4 my-2" onClick={() => this.setState({ mode: "edit" })}>Edit profile</Button>
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
          <div className="circle-avatar w-50 hover-delete" style={editedUser.img ? { backgroundImage: `url(${editedUser.img})` } : { backgroundColor: userService.getUserColor(editedUser.username) }} />
          <Button variant="dark" className={"profile-delete border-none text-center" + (editedUser.img ? "" : " d-none")} onClick={() => this.setState({ editedUser: { ...editedUser, img: "" }, imgName: "" })} >
            <i className="fas fa-times" />
          </Button>
          <br />
          <div>
            <Form className="custom-file w-75">
              <Form.Control type="file" className="custom-file-input" onClick={e => e.currentTarget.value = ""} onChange={this.uploadImg} />
              <Form.Label className="custom-file-label text-left">
                {
                  this.state.imgName ?
                    this.state.imgName.length >= 15 ?
                      this.state.imgName.substr(0, 15) + "..."
                      : this.state.imgName
                    : "Choose file"
                }
              </Form.Label>
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
            <Row className="align-items-center mb-2 mb-md-0" noGutters>
              <Col xs={12} sm={4} md={3} xl={2} as="h6"><strong>Birth date:</strong></Col>
              <Col xs={12} sm={8} md={9} xl={10} as="h6">
                <Row noGutters>
                  <Col xs={4} className="pr-2">
                    <Form.Control as="select"
                      onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'day')}
                      value={moment(editedUser.date_of_birth).date()}>
                      {
                        Array(31).fill().map((_, i) => i + 1)
                          .map(day => <option>{day}</option>)
                      }
                    </Form.Control>
                  </Col>
                  <Col xs={4} className="px-1">
                    <Form.Control as="select"
                      onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'month')}
                      value={moment(editedUser.date_of_birth).format('MMM')}>
                      {
                        Array(12).fill().map((_, i) => moment().month(i).format('MMM'))
                          .map(month => <option>{month}</option>)
                      }
                    </Form.Control>
                  </Col>
                  <Col xs={4} className="pl-2">
                    <Form.Control as="select"
                      onChange={(e) => this.changeBirthDate(e.currentTarget.value, 'year')}
                      value={moment(editedUser.date_of_birth).year()}>
                      {
                        Array(80).fill().map((_, i) => moment().year() - i)
                          .map(year => <option>{year}</option>)
                      }
                    </Form.Control>
                  </Col>
                </Row>
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
              "" + editedUser.user_id !== "" + Number(this.state.search.user_id) ? "" :
                <>
                  <Button type="submit" variant="success" className="mr-4 my-2">Save changes</Button>
                  <Button variant="secondary" className="my-2" onClick={() => this.setState({ mode: "", editedUser: { ...this.state.currentUser } })}>Cancel</Button>
                </>
            }
          </Form>
        </Col>
      </Row>
    )
  }

  getPreviousReviews = () => {
    const reviews = this.state.reviews;
    const user = this.state.user;
    if (reviews.length === 0) {
      return <></>;
    }
    return (
      <div className="px-content">
        <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
          <h3>Review's history</h3>
        </Row>
        {
          reviews.map(review => {
            const hotel = review.hotel;
            return (
              <>
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
                    <h5 className="d-inline">{review.title} </h5>
                    <a className="fs-14 text-dark" href={this.getHotelLink(hotel.hotel_id)}>@{hotel.name}</a>
                    <div className="fs-14">{this.getRatingStar(review.rating)} {moment(review.date).format("D MMM YYYY")}</div>
                    {review.comment}
                  </Col>
                </Row>
                <hr className="my-2" />
              </>
            )
          })
        }
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
    let hotels = this.state.hotels;
    if (hotels.length === 0) {
      return <></>;
    }
    return (
      <>
        <div className="px-content">
          <Row className="align-items-center mt-5 scroll-snap-child" noGutters>
            <h3>Managed Hotels</h3>
          </Row>
        </div>
        <Row>
          {
            this.state.currentUser && this.state.currentUser.user_id === this.state.user.user_id ?
              hotels.map(hotel => {
                return (
                  <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                    <HotelManageCard hotel={hotel} currentUser={this.state.currentUser} />
                  </Col>
                )
              })
              :
              hotels.map(hotel => {
                return (
                  <Col xl={4} sm={6} xs={12} className="my-3 scroll-snap-child" key={hotel.hotel_id}>
                    <HotelCard search={this.state.search} hotel={hotel} />
                  </Col>
                )
              })
          }
        </Row>
      </>
    )
  }
}
