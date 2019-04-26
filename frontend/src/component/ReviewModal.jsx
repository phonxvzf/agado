import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { reviewService } from '../service/reviewService';
import { userService } from '../service/userService';
import CustomModal from './CustomModal';

export default class ReviewModal extends Component {
  componentWillMount() {
    this.setState({
      currentUser: userService.getCurrentUser(),
      showRating: 5,
      review: {
        rating: 5
      }
    });
    this.loadOldReview();
  }

  loadOldReview = () => {
    const oldReview = this.props.oldReview;
    if (oldReview) {
      this.setState({
        showRating: oldReview.rating,
        review: {
          title: oldReview.title,
          rating: oldReview.rating,
          comment: oldReview.comment
        }
      });
    }
  }

  createReview = (e) => {
    e.preventDefault();
    const review = {
      hotel_id: this.props.hotel_id,
      user_id: this.state.currentUser.user_id,
      title: this.state.review.title,
      date: new Date(),
      rating: this.state.review.rating,
      comment: this.state.review.comment
    }
    if (reviewService.createReview(review)) {
      this.setState({ showModal: "create_completed" });
    }
  }

  editReview = (e) => {
    e.preventDefault();
    const editedReview = {
      title: this.state.review.title,
      date: new Date(),
      rating: this.state.review.rating,
      comment: this.state.review.comment
    }
    if (reviewService.editReview(this.props.oldReview.review_id, editedReview)) {
      this.setState({ showModal: "edit_completed" });
    }
  }

  deleteReview = (e) => {
    e.preventDefault();
    if (reviewService.deleteReview(this.props.oldReview.review_id)) {
      window.history.go();
    }
  }

  getHotelLink = () => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hotel_id: Number(this.props.hotel_id),
      checkin: this.props.checkin,
      checkout: this.props.checkout
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  render() {
    const currentUser = userService.getCurrentUser();
    if (!currentUser || currentUser.user_type === "hotel_manager") {
      return (
        <CustomModal showModal={this.props.showModal} closeModal={this.props.closeModal}
          title="You are not signing in yet"
          body="Please sign in/sign up first." />
      )
    }
    return (
      <>
        <CustomModal
          showModal={this.props.showModal}
          closeModal={() => { this.loadOldReview(); this.props.closeModal(); }}
          dialogClassName={this.state.showModal ? "d-none" : ""}
          all={
            <Form onSubmit={this.createReview}>
              <Modal.Header closeButton>
                <Modal.Title>{this.props.oldReview ? "Edit review" : "Write a new review"}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row className="align-items-center my-3">
                  <Col xs={12} md={3} as="h6"><strong>Star:</strong></Col>
                  <Col xs={12} md={9} as="h3">
                    <i className={this.state.showRating >= 1 ? "fas fa-star" : "far fa-star"}
                      onClick={() => this.setState({ review: { ...this.state.review, rating: this.state.showRating } })}
                      onMouseEnter={() => this.setState({ showRating: 1 })}
                      onMouseLeave={() => this.setState({ showRating: this.state.review.rating })} />
                    <i className={this.state.showRating >= 2 ? "fas fa-star" : "far fa-star"}
                      onClick={() => this.setState({ review: { ...this.state.review, rating: this.state.showRating } })}
                      onMouseEnter={() => this.setState({ showRating: 2 })}
                      onMouseLeave={() => this.setState({ showRating: this.state.review.rating })} />
                    <i className={this.state.showRating >= 3 ? "fas fa-star" : "far fa-star"}
                      onClick={() => this.setState({ review: { ...this.state.review, rating: this.state.showRating } })}
                      onMouseEnter={() => this.setState({ showRating: 3 })}
                      onMouseLeave={() => this.setState({ showRating: this.state.review.rating })} />
                    <i className={this.state.showRating >= 4 ? "fas fa-star" : "far fa-star"}
                      onClick={() => this.setState({ review: { ...this.state.review, rating: this.state.showRating } })}
                      onMouseEnter={() => this.setState({ showRating: 4 })}
                      onMouseLeave={() => this.setState({ showRating: this.state.review.rating })} />
                    <i className={this.state.showRating >= 5 ? "fas fa-star" : "far fa-star"}
                      onClick={() => this.setState({ review: { ...this.state.review, rating: this.state.showRating } })}
                      onMouseEnter={() => this.setState({ showRating: 5 })}
                      onMouseLeave={() => this.setState({ showRating: this.state.review.rating })} />
                  </Col>
                </Row>
                <Row className="align-items-center my-3">
                  <Col xs={12} md={3} as="h6"><strong>Title:</strong></Col>
                  <Col xs={12} md={9}>
                    <Form.Control
                      type="text"
                      onChange={(e) => this.setState({ review: { ...this.state.review, title: e.currentTarget.value } })}
                      placeholder="Title"
                      defaultValue={this.state.review.title}
                      required />
                  </Col>
                </Row>
                <Row className="align-items-center my-3">
                  <Col xs={12} md={3} as="h6"><strong>Comment:</strong></Col>
                  <Col xs={12} md={9}>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      onChange={(e) => this.setState({ review: { ...this.state.review, comment: e.currentTarget.value } })}
                      placeholder="Comment"
                      defaultValue={this.state.review.comment}
                      required />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {
                  this.props.oldReview ?
                    <>
                      <Button variant="info" onClick={this.editReview}>Edit</Button>
                      <Button variant="danger" onClick={() => this.setState({ showModal: "delete_confirm" })}>Delete</Button>
                    </> :
                    <Button type="submit" variant="success">Create</Button>
                }
                <Button variant="secondary" onClick={() => { this.loadOldReview(); this.props.closeModal(); }}>Close</Button>
              </Modal.Footer>
            </Form>
          } />
        <CustomModal
          showModal={this.state.showModal === "create_completed"}
          closeModal={() => { window.location.href = this.getHotelLink() + "#hotel_reviews"; window.history.go(); }}
          title="Create completed"
          body="You can see your review now and you can also edit or delete this review later." />
        <CustomModal
          showModal={this.state.showModal === "edit_completed"}
          closeModal={() => { window.location.href = this.getHotelLink() + "#hotel_reviews"; window.history.go(); }}
          title="Edit completed"
          body="You can see your edited review now." />
        <CustomModal
          showModal={this.state.showModal === "delete_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Are you sure to delete this review?"
          body="Your review will be gone forever. You will not be able to revert this."
          footer={
            <Button variant="danger" onClick={this.deleteReview}>Yes, delete it!</Button>
          } />
      </>
    )
  }
}
