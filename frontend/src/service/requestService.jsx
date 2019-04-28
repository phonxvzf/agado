import axios from 'axios';
import { hotelService } from "./hotelService";
import { userService } from "./userService";

export class requestService {
  static getRequests = () => {
    return JSON.parse(localStorage.getItem("requests"));
  }

  static getRequestOf = async () => {
    return await axios.get(`/request`, {
      headers: {
        Authorization: `Bearer ${userService.getToken()}`
      }
    })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return [];
      })
    // let requests = this.getRequests();
    // requests = await requests.filter(async request => {
    //   const hotel = await hotelService.getHotel(request.hotel_id);
    //   return hotel.managers && hotel.managers.includes(user_id);
    // });
    // return requests;
  }

  static createRequest = async (request) => {
    return await axios.post('/request', request, {
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
    // let requests = this.getRequests();
    // request.request_id = requests.length + 1;
    // requests.push(request);
    // localStorage.setItem("requests", JSON.stringify(requests));
    // return true;
  }

  static editRequest = async (request_id, editedRequest) => {
    return await axios.put(`/request?request_id=${request_id}`, editedRequest, {
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
    // let requests = this.getRequests();
    // for (let i = 0; i < requests.length; i++) {
    //   if ("" + request_id === "" + requests[i].request_id) {
    //     requests[i] = {
    //       ...requests[i],
    //       ...editedRequest
    //     }
    //     localStorage.setItem("requests", JSON.stringify(requests));
    //     return true;
    //   }
    // }
    // return false;
  }

  static deleteRequest = async (request_id) => {
    return await axios.delete(`/request?request_id=${request_id}`, {
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
    // let requests = this.getRequests();
    // requests = requests.filter(request => "" + request.request_id !== "" + request_id);
    // localStorage.setItem("requests", JSON.stringify(requests));
    // return true;
  }

  static isRequestPending = async (hotel_id) => {
    return await axios.get(`/request?hotel_id=${hotel_id}`, {
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
    // let requests = this.getRequests();
    // for (let i = 0; i < requests.length; i++) {
    //   const request = requests[i];
    //   if ("" + hotel_id === "" + request.hotel_id && "" + user_id === "" + request.user_id) {
    //     return true;
    //   }
    // }
    // return false;
  }

  static acceptRequest = async (request_id, hotel_id, user_id) => {
    if (await hotelService.addManager(hotel_id, user_id) && await this.deleteRequest(request_id)) {
      window.history.go();
    }
  }

  static rejectRequest = async (request_id) => {
    if (await this.deleteRequest(request_id)) {
      window.history.go();
    }
  }
}