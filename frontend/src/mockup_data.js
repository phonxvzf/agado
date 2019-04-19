let hotels = [];
let hotel = {
  hid: 1,
  name: "New York Skyline Hotel",
  city: "New York",
  address: "1/3 Moo 6, Thanarat Road, Moo Si, Pakchong, Khao Yai National Park, Khao Yai, Thailand, 30130",
  desc: "Take a look at New York view, the best way to see this city. You will find all the classic buildings, sights and more plus. Bootstrap includes a few general use CSS transitions that can be applied to a number of components. Add a collapse toggle animation to an element or component.",
  rating: 2.7,
  review: 134,
  price: 75,
  roomLeft: 26,
  reviews: [84, 32, 2, 11, 5],
  imgs: ['/image/hotel2-1.jpg',
    '/image/hotel2-2.jpg',
    '/image/hotel2-3.jpg',
    '/image/hotel2-4.jpg',
    '/image/hotel2-5.jpg',
    '/image/hotel1.jpg']
};

for (let i = 0; i < 7; ++i) {
  hotel.hid = i + 1;
  hotels.push(JSON.parse(JSON.stringify(hotel)));
}

let userReviews = [];
let userReview = {
  rid: 1,
  user: {
    uid: 1,
    username: "",
    first_name: "",
    last_name: "",
    img: ""
  },
  title: "Excellent value for money",
  date: new Date(),
  rating: 4,
  comment: "For the price this represented the best value for money l have come across in Northern France including other stations around the Amiens station Five minutes walk to station. Close to lovely restaurant area on canal and parks. Small kitchen with hot plate, microwave and enough utensils Staff were very helpful Note: entrance is on the main road with reception up to 1st floor."
};

for (let i = 0; i < 13; ++i) {
  userReview.rid = i + 1;
  userReview.user.uid = Math.ceil(Math.random() * 3);
  const user = userService.getUser(userReview.user.uid);
  userReview.user = {
    uid: user.uid,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    img: user.img
  };
  userReviews.push(JSON.parse(JSON.stringify(userReview)));
}

let rooms = [];
let room = {
  rid: 1,
  name: "MUTHI maya Forest Pool Villa",
  imgs: ['/image/hotel2-3.jpg',
    '/image/hotel2-4.jpg'],
  bed: 2,
  maxPerson: 2,
  price: 890,
  availableRoom: 23,
  amenities: [{
    aid: 1,
    name: "Wi-Fi",
    tag: '<i class="fas fa-wifi"></i>'
  }, {
    aid: 2,
    name: "Telephone",
    tag: '<i class="fas fa-phone"></i>'
  }, {
    aid: 3,
    name: "Bathtub",
    tag: '<i class="fas fa-bath"></i>'
  }, {
    aid: 4,
    name: "Shower",
    tag: '<i class="fas fa-shower"></i>'
  }, {
    aid: 5,
    name: "TV",
    tag: '<i class="fas fa-tv"></i>'
  }, {
    aid: 6,
    name: "Wi-Fi",
    tag: '<i class="fas fa-wifi"></i>'
  }, {
    aid: 7,
    name: "Telephone",
    tag: '<i class="fas fa-phone"></i>'
  }, {
    aid: 8,
    name: "Bathtub",
    tag: '<i class="fas fa-bath"></i>'
  }, {
    aid: 9,
    name: "Shower",
    tag: '<i class="fas fa-shower"></i>'
  }, {
    aid: 10,
    name: "TV",
    tag: '<i class="fas fa-tv"></i>'
  }]
};

for (let i = 0; i < 7; ++i) {
  room.rid = i + 1;
  rooms.push(JSON.parse(JSON.stringify(room)));
}