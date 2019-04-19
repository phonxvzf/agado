export class userService {
  static getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  }

  static getUsers = () => {
    return JSON.parse(localStorage.getItem("users"));
  }

  static getUser = (user_id) => {
    const users = this.getUsers();
    for (let i = 0; i < users.length; ++i) {
      if ("" + user_id === "" + users[i].user_id) {
        return users[i];
      }
    }
    return null;
  }

  static signup = (user) => {
    let users = this.getUsers();
    for (let i = 0; i < users.length; ++i) {
      if (user.username === users[i].username && user.user_type === users[i].user_type) {
        return false;
      }
    }
    user.user_id = users.length + 1;
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(user));
    return true;
  }
  
  static signin = (user) => {
    const users = this.getUsers();
    for (let i = 0; i < users.length; ++i) {
      if (user.username === users[i].username && user.password === users[i].password && user.user_type === users[i].user_type) {
        localStorage.setItem("user", JSON.stringify(users[i]));
        return true;
      }
    }
    return false;
  }

  static signout = () => {
    localStorage.setItem("user", null);
    window.location.href = "/";
  }

  static editUserInfo = (editedUser) => {
    let users = this.getUsers();
    for (let i = 0; i < users.length; ++i) {
      if ("" + editedUser.user_id === "" + users[i].user_id) {
        users[i] = {
          ...users[i],
          ...editedUser
        }
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("user", JSON.stringify(users[i]));
        return true;
      }
    }
    return false;
  }

  static deleteUser = (user_id) => {
    let users = this.getUsers();
    users = users.filter(user => { return "" + user.user_id !== "" + user_id });
    localStorage.setItem("users", JSON.stringify(users));
    return true;
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