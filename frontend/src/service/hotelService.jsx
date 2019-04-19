export class hotelService {
  static getHotels = () => {
    return JSON.parse(localStorage.getItem("hotels"));
  }

  static getHotel = (hid) => {
    const hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      if ("" + hid === "" + hotel.hid) {
        return hotel;
      }
    }
    return null;
  }

  static getHotelOf = (uid) => {
    let hotels = this.getHotels();
    hotels = hotels.filter(hotel => hotel.managers.includes(uid));
    return hotels;
  }

  static createHotel = (hotel) => {
    let hotels = this.getHotels();
    hotel.hid = hotels.length + 1;
    hotels.push(hotel);
    localStorage.setItem("hotels", JSON.stringify(hotels));
    return true;
  }

  static editHotel = (hid, editedHotel) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hid === "" + hotels[i].hid) {
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

  static deleteHotel = (hid) => {
    let hotels = this.getHotels();
    hotels = hotels.filter(hotel => { return "" + hotel.hid !== "" + hid });
    localStorage.setItem("hotels", JSON.stringify(hotels));
    return true;
  }

  static cancelManagement = (hid, uid) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hid === "" + hotels[i].hid) {
        hotels[i].managers = hotels[i].managers.filter(manager => "" + manager !== "" + uid);
        if (hotels[i].managers.length === 0) {
          return this.deleteHotel(hid);
        }
        localStorage.setItem("hotels", JSON.stringify(hotels));
        return true;
      }
    }
    return false;
  }

  static addManager = (hid, uid) => {
    let hotels = this.getHotels();
    for (let i = 0; i < hotels.length; i++) {
      if ("" + hid === "" + hotels[i].hid) {
        hotels[i].managers.push(uid);
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