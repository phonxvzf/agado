interface Review {
  review_id?: number;
  user_id: number;
  hotel_id: number;
  title: string;
  comment: string;
  rating: number;
  date: Date;
}

export default Review;
