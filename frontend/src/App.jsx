
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
    this.setState({
      mode: "view",
      priceRange: {
        min: -Infinity,
        max: Infinity
      },
      preventLeavePage: true,
      isFiltering: false
    });
  }

  componentDidMount() {
    const pathname = window.location.pathname;
    window.onbeforeunload = () => {
      if (this.state.preventLeavePage) {
        if (pathname === "/payment" || pathname === "/hotel/create" || (pathname === "/hotel" && this.state.mode === "edit")) {
          return true;
        }
      }
      return;
    };

    const hash = window.location.hash;
    if (hash) {
      const gotoHash = setInterval(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          clearInterval(gotoHash);
        }
      }, 100);
    }

    document.onclick = (e) => {
      if (e.target &&
        e.target !== document.querySelector('.navbar-toggler') &&
        e.target !== document.querySelector('.navbar-toggler-icon') &&
        !e.target.classList.contains('navbar-collapse') &&
        document.querySelector('.navbar-collapse').classList.contains('show')) {
        document.querySelector('.navbar-toggler').click();
      }
    }
  }

  toggleMode = () => {
    this.setState({
      mode: this.state.mode === "view" ? "edit" : "view"
    });
  }

  setPriceRange = (priceRange) => {
    this.setState({
      priceRange: priceRange
    });
  }

  setPreventLeavePage = (preventLeavePage) => {
    this.setState({
      preventLeavePage: preventLeavePage
    });
  }

  setFiltering = (isFiltering) => {
    this.setState({
      isFiltering: isFiltering
    });
  }

  render() {
    return (
      <>
        <div className="scroll-snap-container">
          <CustomNavBar mode={this.state.mode} toggleMode={this.toggleMode} priceRange={this.state.priceRange} setFiltering={this.setFiltering} />
          <Router>
            <Switch>
              <Route exact path="/" render={() => <Home />} />
              <Route path="/tutorial" render={() => <Tutorial />} />
              <Route path="/search" render={() => <SearchResult setPriceRange={this.setPriceRange} setFiltering={this.setFiltering} isFiltering={this.state.isFiltering} />} />
              <Route path="/profile" render={() => <Profile />} />

              <Route path="/payment" render={() => <Payment setPreventLeavePage={this.setPreventLeavePage} />} />
              <Route path="/reservation" render={() => <Reservation />} />

              <Route path="/request" render={() => <Request />} />
              <Route path="/myhotel" render={() => <MyHotel />} />
              <Route path="/hotel/reservation" render={() => <HotelReservation />} />
              <Route path="/hotel/create" render={() => <CreateHotel setPreventLeavePage={this.setPreventLeavePage} />} />
              <Route path="/hotel" render={() => <HotelInfo mode={this.state.mode} setPreventLeavePage={this.setPreventLeavePage} />} />
            </Switch>
          </Router>
          <Footer />
        </div>
      </>
    );
  }
}

export default App;