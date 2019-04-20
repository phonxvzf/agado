
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CustomNavBar from './component/CustomNavBar';
import Footer from './component/Footer';
import CreateHotel from './page/CreateHotel';
import Home from './page/Home';
import HotelInfo from './page/HotelInfo';
import HotelReservation from './page/HotelReservation';
import MyHotel from './page/MyHotel';
import Payment from './page/Payment';
import Profile from './page/Profile';
import Request from './page/Request';
import Reservation from './page/Reservation';
import SearchResult from './page/SearchResult';
import Tutorial from './page/Tutorial';

class App extends Component {
  componentWillMount() {
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify([]));
    }

    if (!localStorage.getItem("reviews")) {
      localStorage.setItem("reviews", JSON.stringify([]));
    }

    if (!localStorage.getItem("hotels")) {
      localStorage.setItem("hotels", JSON.stringify([]));
    }

    if (!localStorage.getItem("requests")) {
      localStorage.setItem("requests", JSON.stringify([]));
    }

    if (!localStorage.getItem("reservations")) {
      localStorage.setItem("reservations", JSON.stringify([]));
    }

    this.setState({
      mode: "view",
      priceRange: {
        min: -Infinity,
        max: Infinity
      }
    });
  }

  toggleMode = () => {
    this.setState({
      mode: this.state.mode === "view" ? "edit" : "view"
    })
  }

  setPriceRange = (priceRange) => {
    this.setState({
      priceRange: priceRange
    });
  }

  render() {
    return (
      <>
        <div className="scroll-snap-container">
          <CustomNavBar mode={this.state.mode} toggleMode={this.toggleMode} priceRange={this.state.priceRange} />
          <Router>
            <Switch>
              <Route exact path="/" render={() => <Home />} />
              <Route path="/tutorial" render={() => <Tutorial />} />
              <Route path="/search" render={() => <SearchResult setPriceRange={this.setPriceRange} />} />
              <Route path="/profile" render={() => <Profile />} />

              <Route path="/payment" render={() => <Payment />} />
              <Route path="/reservation" render={() => <Reservation />} />
              
              <Route path="/request" render={() => <Request />} />
              <Route path="/myhotel" render={() => <MyHotel />} />
              <Route path="/hotel/reservation" render={() => <HotelReservation />} />
              <Route path="/hotel/create" render={() => <CreateHotel />} />
              <Route path="/hotel" render={() => <HotelInfo mode={this.state.mode} />} />
            </Switch>
          </Router>
          <Footer />
        </div>
      </>
    );
  }
}

export default App;