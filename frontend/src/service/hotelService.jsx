import { reviewService } from "./reviewService";

export class hotelService {
  static getHotels = () => {
    let hotels = JSON.parse(localStorage.getItem("hotels"));
    for (let i = 0; i < hotels.length; i++) {
      let hotel = hotels[i];
      const reviews = reviewService.getHotelReviews(hotel.hotel_id);

      hotel.reviews = reviews;
      hotel.rating = reviews.length > 0 ? (reviews.map(review => review.rating).reduce((a, b) => a + b, 0)) / reviews.length : 0;
      hotel.total_review = reviews.length;
      hotel.num_rating5 = (reviews.filter(review => review.rating === 5)).length;
      hotel.num_rating4 = (reviews.filter(review => review.rating === 4)).length;
      hotel.num_rating3 = (reviews.filter(review => review.rating === 3)).length;
      hotel.num_rating2 = (reviews.filter(review => review.rating === 2)).length;
      hotel.num_rating1 = (reviews.filter(review => review.rating === 1)).length;
      hotel.start_price = hotel.rooms.map(room => room.price).reduce((a, b) => Math.min(a, b), Infinity);
      hotel.start_price = hotel.start_price === Infinity ? 0 : hotel.start_price;
      hotel.room_left = hotel.rooms.map(room => room.available_room).reduce((a, b) => a + b, 0);

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
    hotel.rooms = hotel.rooms.map(room => {
      room.amenities = room.amenities.map((amenity, idx) => {
        if (!idx) {
          return amenity ? 0 : 1;
        }
        if (amenity) {
          return idx;
        }
      });
      room.amenities = room.amenities.reduce((amenities, x) => amenities = x ? amenities.concat(x) : amenities, []);
      return room;
    });
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