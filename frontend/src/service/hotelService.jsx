import axios from 'axios';
import { userService } from './userService';

const baseImgPath = "http://agado-imgs.storage.googleapis.com/";

export class hotelService {
  static fillHotelInfo = (hotel) => {
    const reviews = hotel.reviews;
    hotel.imgs = hotel.imgs.map(img => img ? baseImgPath + img : img)
    hotel.rooms = hotel.rooms.map(room => {
      return {
        ...room,
        imgs: room.imgs.map(img => img ? baseImgPath + img : img)
      };
    });
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
    return hotel
  }

  static getHotels = async (checkin, checkout) => {
    if (checkin && checkout) {
      return await axios.get(`/search?checkin=${checkin}&checkout=${checkout}`)
        .then(res => {
          let hotels = res.data
          hotels = hotels.map(hotel => this.fillHotelInfo(hotel));
          return hotels;
        })
        .catch(err => {
          return [];
        })
    }
    return await axios.get(`/search`)
      .then(res => {
        let hotels = res.data
        hotels = hotels.map(hotel => this.fillHotelInfo(hotel));
        return hotels;
      })
      .catch(err => {
        return [];
      })
    // let hotels = JSON.parse(localStorage.getItem("hotels"));
    // for (let i = 0; i < hotels.length; i++) {
    //   let hotel = hotels[i];
    //   const reviews = reviewService.getHotelReviews(hotel.hotel_id);

    //   hotel.reviews = reviews;
    //   hotel = this.fillHotelInfo(hotel);
    //   hotels[i] = hotel;
    // }
    // localStorage.setItem("hotels", JSON.stringify(hotels));

    // return hotels;
  }

  static getHotel = async (hotel_id, checkin, checkout) => {
    return await axios.get(`/hotel?hotel_id=${hotel_id}&checkin=${checkin}&checkout=${checkout}`)
      .then(res => {
        const hotel = this.fillHotelInfo(res.data);
        return hotel;
      })
      .catch(err => {
        return null;
      })
    // const hotels = this.getHotels();
    // for (let i = 0; i < hotels.length; i++) {
    //   const hotel = hotels[i];
    //   if ("" + hotel_id === "" + hotel.hotel_id) {
    //     return hotel;
    //   }
    // }
    // return null;
  }

  static getHotelOf = async (user_id) => {
    return await axios.get(`/hotel/of_user?user_id=${user_id}`)
      .then(async res => {
        let hotels = res.data;
        hotels = hotels.map(hotel => this.fillHotelInfo(hotel));
        return hotels
      })
      .catch(err => {
        return [];
      })
    // let hotels = this.getHotels();
    // hotels = hotels.filter(hotel => hotel.managers.includes(user_id));
    // return hotels;
  }

  static createHotel = async (data) => {
    let hotel = JSON.parse(JSON.stringify(data));
    hotel.imgs = hotel.imgs.map(img => !img ? null : img.startsWith('data:') ? img : img.substr(41));
    hotel.rooms = hotel.rooms.map(room => {
      return {
        ...room,
        imgs: room.imgs.map(img => !img ? null : img.startsWith('data:') ? img : img.substr(41))
      };
    });
    return await axios.post('/hotel', hotel, {
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
    // let hotels = this.getHotels();
    // hotel.hotel_id = hotels.length + 1;
    // hotels.push(hotel);
    // localStorage.setItem("hotels", JSON.stringify(hotels));
    // return true;
  }

  static editHotel = async (data) => {
    let editedHotel = JSON.parse(JSON.stringify(data));
    editedHotel.imgs = editedHotel.imgs.map(img => !img ? null : img.startsWith('data:') ? img : img.substr(41));
    editedHotel.rooms = editedHotel.rooms.map(room => {
      return {
        ...room,
        imgs: room.imgs.map(img => !img ? null : img.startsWith('data:') ? img : img.substr(41))
      };
    });
    return await axios.put('/hotel', editedHotel, {
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
    // let hotels = this.getHotels();
    // for (let i = 0; i < hotels.length; i++) {
    //   if ("" + hotel_id === "" + hotels[i].hotel_id) {
    //     hotels[i] = {
    //       ...hotels[i],
    //       ...editedHotel
    //     }
    //     localStorage.setItem("hotels", JSON.stringify(hotels));
    //     return true;
    //   }
    // }
    // return false;
  }

  static deleteHotel = async (hotel_id) => {
    return await axios.delete(`/hotel?hotel_id=${hotel_id}`, {
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
    // let hotels = this.getHotels();
    // hotels = hotels.filter(hotel => { return "" + hotel.hotel_id !== "" + hotel_id });
    // localStorage.setItem("hotels", JSON.stringify(hotels));
    // return true;
  }

  static cancelManagement = async (hotel_id, user_id) => {
    return await axios.delete(`/hotel/manager?hotel_id=${hotel_id}&user_id=${user_id}`, {
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
    // let hotels = this.getHotels();
    // for (let i = 0; i < hotels.length; i++) {
    //   if ("" + hotel_id === "" + hotels[i].hotel_id) {
    //     hotels[i].managers = hotels[i].managers.filter(manager => "" + manager !== "" + user_id);
    //     if (hotels[i].managers.length === 0) {
    //       return this.deleteHotel(hotel_id);
    //     }
    //     localStorage.setItem("hotels", JSON.stringify(hotels));
    //     return true;
    //   }
    // }
    // return false;
  }

  static addManager = async (hotel_id, user_id) => {
    return await axios.post(`/hotel/manager?hotel_id=${hotel_id}&user_id=${user_id}`, {}, {
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
    // let hotels = this.getHotels();
    // for (let i = 0; i < hotels.length; i++) {
    //   if ("" + hotel_id === "" + hotels[i].hotel_id) {
    //     hotels[i].managers.push(user_id);
    //     localStorage.setItem("hotels", JSON.stringify(hotels));
    //     return true;
    //   }
    // }
    // return false;
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