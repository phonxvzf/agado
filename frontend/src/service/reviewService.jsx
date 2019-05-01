import axios from 'axios';
import { userService } from "./userService";

export class reviewService {
  static getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews"));
  }

  static getReviewsOf = async (user_id) => {
    return await axios.get(`/review/of_user?user_id=${user_id}`)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return null;
      })
    // let reviews = this.getReviews();
    // reviews = reviews.filter(review => { return "" + review.user_id === "" + user_id });
    // return reviews;
  }

  static getHotelReviews = async (hotel_id) => {
    return await axios.get(` /review/of_hotel?hotel_id=${hotel_id}`)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return null;
      })
    // let reviews = this.getReviews();
    // reviews = reviews.filter(review => { return "" + review.hotel_id === "" + hotel_id });
    // return reviews;
  }

  static createReview = async (review) => {
    return await axios.post('/review', review, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reviews = this.getReviews();
    // review.review_id = reviews.length + 1;
    // reviews.push(review);
    // localStorage.setItem("reviews", JSON.stringify(reviews));
    // return true;
  }

  static editReview = async (review_id, editedReview) => {
    return await axios.put(`/review?review_id=${review_id}`, editedReview, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reviews = this.getReviews();
    // for (let i = 0; i < reviews.length; i++) {
    //   if ("" + review_id === "" + reviews[i].review_id) {
    //     reviews[i] = {
    //       ...reviews[i],
    //       ...editedReview
    //     }
    //     localStorage.setItem("reviews", JSON.stringify(reviews));
    //     return true;
    //   }
    // }
    // return false;
  }

  static deleteReview = async (review_id) => {
    return await axios.delete(`/review?review_id=${review_id}`, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let reviews = this.getReviews();
    // reviews = reviews.filter(review => { return "" + review.review_id !== "" + review_id });
    // localStorage.setItem("reviews", JSON.stringify(reviews));
    // return true;
  }

  static getOldReview = async (hotel_id) => {
    return await axios.get(`/review?hotel_id=${hotel_id}`, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        console.log(res.data)
        return res.data;
      })
      .catch(err => {
        return null;
      })
    // const reviews = this.getReviews();
    // for (let i = 0; i < reviews.length; i++) {
    //   const review = reviews[i];
    //   if ("" + user_id === "" + review.user_id && "" + hotel_id === "" + review.hotel_id) {
    //     return review;
    //   }
    // }
    // return null;
  }
}