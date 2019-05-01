import axios from 'axios';

axios.defaults.baseURL = (process.env.NODE_ENV !== 'production') ? 'http://' + window.location.hostname + ':3000' : '/api';
const baseImgPath = "http://agado-imgs.storage.googleapis.com/";

export class userService {
  static getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  }

  static getToken = () => {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.token : null;
  }

  static getUsers = () => {
    return JSON.parse(localStorage.getItem("users"));
  }

  static getUser = async (user_id) => {
    return await axios.get(`/user?user_id=${user_id}`)
      .then(res => {
        let user = res.data;
        user.img = user.img ? baseImgPath + user.img : null;
        return user;
      })
      .catch(err => {
        return null;
      })
    // const users = this.getUsers();
    // for (let i = 0; i < users.length; ++i) {
    //   if ("" + user_id === "" + users[i].user_id) {
    //     return users[i];
    //   }
    // }
    // return null;
  }

  static signup = async (data) => {
    let user = JSON.parse(JSON.stringify(data));
    user.img = !user.img ? null : user.img.startsWith('data:') ? user.img : user.img.substr(41);
    return await axios.post('/user', user)
      .then(res => {
        localStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
        return true;
      })
      .catch(err => {
        return false;
      })
    // let users = this.getUsers();
    // for (let i = 0; i < users.length; ++i) {
    //   if (user.username === users[i].username && user.user_type === users[i].user_type) {
    //     return false;
    //   }
    // }
    // user.user_id = users.length + 1;
    // users.push(user);
    // localStorage.setItem("users", JSON.stringify(users));
    // localStorage.setItem("user", JSON.stringify(user));
    // return true;
  }

  static signin = async (data) => {
    let user = JSON.parse(JSON.stringify(data));
    user.img = !user.img ? null : user.img.startsWith('data:') ? user.img : user.img.substr(41);
    return await axios.post('/user/login', user)
      .then(res => {
        res.data.img = res.data.img ? baseImgPath + res.data.img : null;
        localStorage.setItem("user", JSON.stringify(res.data));
        return true;
      })
      .catch(err => {
        return false;
      })
    // const users = this.getUsers();
    // for (let i = 0; i < users.length; ++i) {
    //   if (user.username === users[i].username && user.password === users[i].password && user.user_type === users[i].user_type) {
    //     localStorage.setItem("user", JSON.stringify(users[i]));
    //     return true;
    //   }
    // }
    // return false;
  }

  static signout = () => {
    localStorage.setItem("user", null);
    window.location.href = "/";
  }

  static editUserInfo = async (data) => {
    let editedUser = JSON.parse(JSON.stringify(data));
    editedUser.img = !editedUser.img ? null : editedUser.img.startsWith('data:') ? editedUser.img : editedUser.img.substr(41);
    return await axios.put('/user', editedUser, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    })
      .then(res => {
        res.data.img = res.data.img ? baseImgPath + res.data.img : null;
        localStorage.setItem("user", JSON.stringify({ ...editedUser, ...res.data }));
        return true;
      })
      .catch(err => {
        return false;
      })
    // let users = this.getUsers();
    // for (let i = 0; i < users.length; ++i) {
    //   if ("" + editedUser.user_id === "" + users[i].user_id) {
    //     users[i] = {
    //       ...users[i],
    //       ...editedUser
    //     }
    //     localStorage.setItem("users", JSON.stringify(users));
    //     localStorage.setItem("user", JSON.stringify(users[i]));
    //     return true;
    //   }
    // }
    // return false;
  }

  static deleteUser = async () => {
    return await axios.delete('/user', {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    })
      .then(res => {
        return true;
      })
      .catch(err => {
        return false;
      })
    // let users = this.getUsers();
    // users = users.filter(user => { return "" + user.user_id !== "" + user_id });
    // localStorage.setItem("users", JSON.stringify(users));
    // return true;
  }

  static getUserColor = (username) => {
    const str = username ? username : this.getCurrentUser().username;
    let hash = 0;
    for (let i = 0; i < str.length; ++i) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; ++i) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }
}