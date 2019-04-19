import { reviewService } from "./reviewService";

export class hotelService {
  static getHotels = () => {
    let hotels = JSON.parse(localStorage.getItem("hotels"));
    for (let i = 0; i < hotels.length; i++) {
      let hotel = hotels[i];
      const reviews = reviewService.getHotelReviews(hotel.hotel_id);

      hotel.reviews = reviews;
      hotel.rating = reviews.length > 0 ? (reviews.map(review => review.rating).reduce((a, b) => a + b, 0)) / reviews.length : 0;
      hotel.total_reviews = reviews.length;
      hotel.num_rating = [0, 0, 0, 0, 0];
      reviews.forEach(review => hotel.num_rating[5 - review.rating] = hotel.num_rating[5 - review.rating] + 1 );
      hotel.start_price = hotel.rooms.map(room => room.price).reduce((a, b) => Math.min(a, b), Infinity);
      hotel.start_price = hotel.start_price === Infinity ? 0 : hotel.start_price;
      hotel.room_left = hotel.rooms.map(room => room.available_rooms).reduce((a, b) => a + b, 0);

      hotels[i] = hotel;
    }
    localStorage.setItem("hotels", JSON.stringify(hotels));

    return hotels;
  }

  static getHotel = (hotel_id) => {
    const hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      if ("" + hotel_id === "" + hotel.hotel_id) {
        return hotel;
      }
    }
    return null;
  }

  static getHotelOf = (user_id) => {
    let hotels = this.getHotels();
    hotels = hotels.filter(hotel => hotel.managers.includes(user_id));
    return hotels;
  }

  static createHotel = (hotel) => {
    let hotels = this.getHotels();
    hotel.hotel_id = hotels.length + 1;
    hotels.push(hotel);
    localStorage.setItem("hotels", JSON.stringify(hotels));
    return true;
  }

  static editHotel = (hotel_id, editedHotel) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hotel_id === "" + hotels[i].hotel_id) {
        hotels[i] = {
          ...hotels[i],
          ...editedHotel
        }
        localStorage.setItem("hotels", JSON.stringify(hotels));
        return true;
      }
    }
    return false;
  }

  static deleteHotel = (hotel_id) => {
    let hotels = this.getHotels();
    hotels = hotels.filter(hotel => { return "" + hotel.hotel_id !== "" + hotel_id });
    localStorage.setItem("hotels", JSON.stringify(hotels));
    return true;
  }

  static cancelManagement = (hotel_id, user_id) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hotel_id === "" + hotels[i].hotel_id) {
        hotels[i].managers = hotels[i].managers.filter(manager => "" + manager !== "" + user_id);
        if (hotels[i].managers.length === 0) {
          return this.deleteHotel(hotel_id);
        }
        localStorage.setItem("hotels", JSON.stringify(hotels));
        return true;
      }
    }
    return false;
  }

  static addManager = (hotel_id, user_id) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hotel_id === "" + hotels[i].hotel_id) {
        hotels[i].managers.push(user_id);
        localStorage.setItem("hotels", JSON.stringify(hotels));
        return true;
      }
    }
    return false;
  }

  static amenities = [{
    name: "Smoking",
    tag: '<i class="fas fa-smoking"></i>'
  }, {
    name: "No smoking",
    tag: '<i class="fas fa-smoking-ban"></i>'
  }, {
    name: "Wi-Fi",
    tag: '<i class="fas fa-wifi"></i>'
  }, {
    name: "Telephone",
    tag: '<i class="fas fa-phone"></i>'
  }, {
    name: "Bathtub",
    tag: '<i class="fas fa-bath"></i>'
  }, {
    name: "Shower",
    tag: '<i class="fas fa-shower"></i>'
  }, {
    name: "TV",
    tag: '<i class="fas fa-tv"></i>'
  }, {
    name: "Coffee maker",
    tag: '<i class="fas fa-coffee"></i>'
  }, {
    name: "Blender",
    tag: '<i class="fas fa-blender"></i>'
  }, {
    name: "Couch",
    tag: '<i class="fas fa-couch"></i>'
  }, {
    name: "Chair",
    tag: '<i class="fas fa-chair"></i>'
  }, {
    name: "First-aid",
    tag: '<i class="fas fa-medkit"></i>'
  }, {
    name: "Bin",
    tag: '<i class="fas fa-trash"></i>'
  }];
}