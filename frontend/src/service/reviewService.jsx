export class reviewService {
  static getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews"));
  }

  static getReviewsOf = (uid) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.uid === "" + uid });
    return reviews;
  }

  static getHotelReviews = (hid) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.hid === "" + hid });
    return reviews;
  }

  static createReview = (review) => {
    let reviews = this.getReviews();
    review.rid = reviews.length + 1;
    reviews.push(review);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return true;
  }

  static editReview = (rid, editedReview) => {
    let reviews = this.getReviews();
    for (let i = 0; i < reviews.length; i++) {
      if ("" + rid === "" + reviews[i].rid) {
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

  static deleteReview = (rid) => {
    let reviews = this.getReviews();
    reviews = reviews.filter(review => { return "" + review.rid !== "" + rid });
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return true;
  }

  static getOldReview = (uid, hid) => {
    const reviews = this.getReviews();
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      if ("" + uid === "" + review.uid && "" + hid === "" + review.hid) {
        return review;
      }
    }
    return null;
  }
}