import { hotelService } from "./hotelService";

export class requestService {
  static getRequests = () => {
    return JSON.parse(localStorage.getItem("requests"));
  }

  static getRequestOf = (uid) => {
    let requests = this.getRequests();
    requests = requests.filter(request => {
      const hotel = hotelService.getHotel(request.hid);
      return hotel && hotel.managers.includes(uid);
    });
    return requests;
  }

  static createRequest = (request) => {
    let requests = this.getRequests();
    request.rid = requests.length + 1;
    requests.push(request);
    localStorage.setItem("requests", JSON.stringify(requests));
    return true;
  }

  static editRequest = (rid, editedRequest) => {
    let requests = this.getRequests();
    for (let i = 0; i < requests.length; i++) {
      if ("" + rid === "" + requests[i].rid) {
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

  static deleteRequest = (rid) => {
    let requests = this.getRequests();
    requests = requests.filter(request => "" + request.rid !== "" + rid);
    localStorage.setItem("requests", JSON.stringify(requests));
    return true;
  }

  static isRequestPending = (hid, uid) => {
    let requests = this.getRequests();
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if ("" + hid === "" + request.hid && "" + uid === "" + request.uid) {
        return true;
      }
    }
    return false;
  }

  static acceptRequest = (rid, hid, uid) => {
    if (hotelService.addManager(hid, uid) && this.deleteRequest(rid)) {
      window.history.go();
    }
  }

  static rejectRequest = (rid) => {
    if (this.deleteRequest(rid)) {
      window.history.go();
    }
  }
}