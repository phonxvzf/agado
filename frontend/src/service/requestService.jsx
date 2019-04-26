import { hotelService } from "./hotelService";

export class requestService {
  static getRequests = () => {
    return JSON.parse(localStorage.getItem("requests"));
  }

  static getRequestOf = (user_id) => {
    let requests = this.getRequests();
    requests = requests.filter(request => {
      const hotel = hotelService.getHotel(request.hotel_id);
      return hotel && hotel.managers.includes(user_id);
    });
    return requests;
  }

  static createRequest = (request) => {
    let requests = this.getRequests();
    request.request_id = requests.length + 1;
    requests.push(request);
    localStorage.setItem("requests", JSON.stringify(requests));
    return true;
  }

  static editRequest = (request_id, editedRequest) => {
    let requests = this.getRequests();
    for (let i = 0; i < requests.length; i++) {
      if ("" + request_id === "" + requests[i].request_id) {
        requests[i] = {
          ...requests[i],
          ...editedRequest
        }
        localStorage.setItem("requests", JSON.stringify(requests));
        return true;
      }
    }
    return false;
  }

  static deleteRequest = (request_id) => {
    let requests = this.getRequests();
    requests = requests.filter(request => "" + request.request_id !== "" + request_id);
    localStorage.setItem("requests", JSON.stringify(requests));
    return true;
  }

  static isRequestPending = (hotel_id, user_id) => {
    let requests = this.getRequests();
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if ("" + hotel_id === "" + request.hotel_id && "" + user_id === "" + request.user_id) {
        return true;
      }
    }
    return false;
  }

  static acceptRequest = (request_id, hotel_id, user_id) => {
    if (hotelService.addManager(hotel_id, user_id) && this.deleteRequest(request_id)) {
      window.history.go();
    }
  }

  static rejectRequest = (request_id) => {
    if (this.deleteRequest(request_id)) {
      window.history.go();
    }
  }
}