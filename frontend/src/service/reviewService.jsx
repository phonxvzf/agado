export class reviewService {
  static getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews"));
  }

  static getReviewsOf = (user_id) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.user_id === "" + user_id });
    return reviews;
  }

  static getHotelReviews = (hotel_id) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.hotel_id === "" + hotel_id });
    return reviews;
  }

  static createReview = (review) => {
    let reviews = this.getReviews();
    review.review_id = reviews.length + 1;
    reviews.push(review);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return true;
  }

  static editReview = (review_id, editedReview) => {
    let reviews = this.getReviews();
    for (let i = 0; i < reviews.length; i++) {
      if ("" + review_id === "" + reviews[i].review_id) {
        reviews[i] = {
          ...reviews[i],
          ...editedReview
        }
        localStorage.setItem("reviews", JSON.stringify(reviews));
        return true;
      }
    }
    return false;
  }

  static deleteReview = (review_id) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.review_id !== "" + review_id });
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return true;
  }

  static getOldReview = (user_id, hotel_id) => {
    const reviews = this.getReviews();
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      if ("" + user_id === "" + review.user_id && "" + hotel_id === "" + review.hotel_id) {
        return review;
      }
    }
    return null;
  }
}