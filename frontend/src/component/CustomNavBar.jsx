import qs from 'qs';
import React, { Component } from 'react';
import { Badge, Button, Col, Dropdown, Form, Image, InputGroup, Nav, Navbar, OverlayTrigger, Popover, ProgressBar, Row } from 'react-bootstrap';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import '../css/CustomNavBar.css';
import agadoLogo from '../image/agado-logo.png';
import { hotelService } from '../service/hotelService';
import { requestService } from '../service/requestService';
import { userService } from '../service/userService';
import CustomModal from './CustomModal';
import SigninSignupModal from './SigninSignupModal';

export default class CustomNavBar extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser
    });

    this.loadPrice();
    this.loadRating();
    this.loadAmenities();
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  componentWillReceiveProps(nextProps) {
    this.loadPrice(nextProps.priceRange);
  }

  handleScroll = (e) => {
    const winScroll = e.target.scrollTop;
    const height = e.target.scrollHeight - e.target.clientHeight;
    const scrolled = (winScroll / height) * 100;
    this.setState({ scrolled: scrolled });
  }

  getAmenitiesQs = () => {
    let amenities = [];
    for (let i = 0; i < this.state.amenities.length; i++) {
      if (this.state.amenities[i]) {
        amenities.push(i);
      }
    }
    return amenities;
  }

  getSearchLink = () => {
    const pathname = "/search";
    const search = qs.stringify({
      hotel_name: this.state.search.hotel_name,
      checkin: this.state.search.checkin,
      checkout: this.state.search.checkout,
      min_price: this.state.price.min,
      max_price: this.state.price.max,
      rating: this.state.rating,
      amenities: this.getAmenitiesQs()
    }, { addQueryPrefix: true, indices: false });
    return pathname + search;
  }

  getProfileLink = () => {
    const pathname = "/profile";
    const search = qs.stringify({
      user_id: this.state.currentUser.user_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelLink = () => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hotel_id: this.state.search.hotel_id,
      checkin: this.state.search.checkin,
      checkout: this.state.search.checkout
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelEditLink = () => {
    const pathname = "/hotel/edit";
    const search = qs.stringify({
      hotel_id: this.state.search.hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelReservationLink = () => {
    const pathname = "/hotel/reservation";
    const search = qs.stringify({
      hotel_id: this.state.search.hotel_id
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  requestPermission = () => {
    const request = {
      hotel_id: this.state.search.hotel_id,
      user_id: this.state.currentUser.user_id
    }
    if (requestService.createRequest(request)) {
      window.history.go();
    }
  }

  cancelMaagement = () => {
    if (hotelService.cancelManagement(this.state.search.hotel_id, this.state.currentUser.user_id)) {
      window.location.href = "/myhotel";
    }
  }

  isUserOwn = () => {
    const hotel = hotelService.getHotel(this.state.search.hotel_id);
    return hotel && hotel.managers.includes(this.state.currentUser.user_id);
  }

  loadPrice = (priceRange) => {
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    priceRange = priceRange ? priceRange : this.props.priceRange;
    this.setState({
      price: {
        min: search.min_price ? Number(search.min_price) : priceRange.min,
        max: search.max_price ? Number(search.max_price) : priceRange.max
      }
    });
  }

  loadRating = () => {
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      rating: search.rating ? Number(search.rating) : 0,
      showRating: search.rating ? Number(search.rating) : 0
    });
  }

  loadAmenities = () => {
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    if (!search.amenities) {
      this.setState({
        amenities: []
      });
      return;
    }

    let amenities = []
    for (let i = 0; i < search.amenities.length; i++) {
      amenities[Number(search.amenities[i])] = true;
    }
    this.setState({
      amenities: amenities
    });
  }

  toggleAmenitiesFilter = (idx) => {
    let amenities = this.state.amenities;
    amenities[idx] = !amenities[idx];
    this.setState({
      amenities: amenities
    })
  }

  closeAllFilters = () => {
    this.setState({
      showFilter: false
    })
    this.filterPrice.hide();
    this.filterRating.hide();
    this.filterAmenities.hide();
  }

  isAnyAmenitesChanged = () => {
    for (let i = 0; i < hotelService.amenities.length; i++) {
      if (this.state.amenities[i]) {
        return true;
      }
    }
    return false;
  }

  render() {
    return (
      <>
        <Navbar className="shadow pb-0" bg="light" variant="light" fixed="top" expand="md" collapseOnSelect>
          <Row className="align-items-center">
            <Col xs={2} className="d-md-none">
              <Navbar.Toggle />
            </Col>
            <Col xs={4} md={3} xl={2} className="ml-lg-3 ml-xl-5 px-0">
              <Navbar.Brand className="py-0 mx-0" href="/">
                <Image src={agadoLogo} fluid />
              </Navbar.Brand>
            </Col>
            <Col className="mr-auto">
              {this.getSearchTab()}
            </Col>
            <Col xs={12} md={4} className="mr-lg-3 mr-xl-5">
              <Navbar.Collapse className="justify-content-end">
                {this.getUserActions()}
              </Navbar.Collapse>
            </Col>
            <Col xs={12}>
              <Navbar.Collapse className="mx-lg-3 mx-xl-5">
                {this.getSecondRowComponent()}
              </Navbar.Collapse>
            </Col>
            <Col xs={12} className="px-0 pt-1">
              <ProgressBar className="scroll-indicator bg-none" variant="dark" now={this.state.scrolled} />
            </Col>
          </Row>
        </Navbar>
        <div className={"filter-control scroll-snap-child" + (this.state.showFilter ? "" : " d-none")} onClick={this.closeAllFilters} />
        <div className={"filter-bg scroll-snap-child" + (this.state.showFilter ? "" : " d-none")} />
        <SigninSignupModal
          type={this.state.type}
          showModal={this.state.showModal === "signin_signup"}
          closeModal={() => this.setState({ showModal: null })} />
        <CustomModal
          showModal={this.state.showModal === "request_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Please confirm to request permission"
          body="The request will be sent to the hotel managers of this hotel. You will can manage this hotel after the they accept the permission"
          footer={
            <Button variant="success" onClick={this.requestPermission}>Confirm</Button>
          } />
        <CustomModal
          showModal={this.state.showModal === "cancel_management_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Are you sure to cancel your management rights?"
          body="You will not be able to manage this hotel while other managers can still manage this hotel. Except if you are the last manager, the hotel will be removed from the system."
          footer={
            <Button variant="danger" onClick={this.cancelMaagement}>Yes, cancel it</Button>
          } />
      </>
    )
  }

  getSearchTab = () => {
    if (this.state.pathname === "/hotel") {
      return (
        <>
          <div className="d-xs-sm-none d-sm-md-none">
            <Form onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
              <InputGroup>
                <Form.Control
                  className="border-dark"
                  type="text"
                  onChange={(e) => this.setState({ search: { ...this.state.search, hotel_name: e.currentTarget.value } })}
                  placeholder="Hotel or Destination"
                  defaultValue={this.state.search.hotel_name}
                  autoFocus />
                <InputGroup.Append>
                  <Button type="submit" variant="dark"><i className="fas fa-search" /></Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
          </div>
          <div className="text-right d-md-none">
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-info-circle" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-door-closed" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_reviews').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-comment-dots" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_managers').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-users" /></h5>
            </Button>
          </div>
        </>
      )
    } else if (this.state.pathname === "/hotel/create"
      && this.state.currentUser
      && this.state.currentUser.user_type === "hotel_manager") {
      return (
        <div className="text-center">
          <div className="d-xs-sm-none d-sm-md-none">
            <Button type="submit" form="create-hotel" variant="link" className="text-dark pr-5">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create now</strong></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-info-circle" /> Info</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-door-closed" /> Rooms</h6>
            </Button>
          </div>
          <div className="text-right d-md-none">
            <Button type="submit" form="create-hotel" variant="link" className="text-dark pr-2 pl-0">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create</strong></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold pl-0 pr-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-info-circle" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-0"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-door-closed" /></h5>
            </Button>
          </div>
        </div>
      )
    } else if (this.state.pathname === "/hotel/edit"
      && this.state.currentUser
      && this.state.currentUser.user_type === "hotel_manager"
      && hotelService.getHotel(this.state.search.hotel_id)
      && hotelService.getHotel(this.state.search.hotel_id).managers.includes(this.state.currentUser.user_id)) {
      return (
        <div className="text-center">
          <div className="d-xs-sm-none d-sm-md-none">
            <Button type="submit" form="create-hotel" variant="link" className="text-dark pr-5">
              <h5 className="my-0"><strong><i className="fas fa-edit" /> Edit hotel</strong></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-info-circle" /> Info</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-door-closed" /> Rooms</h6>
            </Button>
          </div>
          <div className="text-right d-md-none">
            <Button type="submit" form="create-hotel" variant="link" className="text-dark pr-2">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Edit</strong></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-info-circle" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-1"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-door-closed" /></h5>
            </Button>
          </div>
        </div>
      )
    } else if (this.state.pathname === "/myhotel"
      && this.state.currentUser
      && this.state.currentUser.user_type === "hotel_manager") {
      return (
        <div className="text-center">
          <div className="d-xs-sm-none d-sm-md-none">
            <Button variant="link" className="text-dark pr-5" href="/hotel/create">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create a new hotel</strong></h5>
            </Button>
          </div>
          <div className="text-right d-md-none">
            <Button variant="link" className="text-dark pr-2 pl-0" href="/hotel/create">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create hotel</strong></h5>
            </Button>
          </div>
        </div>
      )
    } else if (this.state.pathname === "/request"
      && this.state.currentUser
      && this.state.currentUser.user_type === "hotel_manager") {
      return (
        <div className="text-center">
          <div className="d-xs-sm-none d-sm-md-none">
            <Button variant="link" className="text-dark pr-5" href="/myhotel">
              <h5 className="my-0"><strong><i className="fas fa-hotel" /> My hotel</strong></h5>
            </Button>
            <Button variant="link" className="text-dark pr-5" href="/hotel/create">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create a new hotel</strong></h5>
            </Button>
          </div>
          <div className="text-right d-md-none">
            <Button variant="link" className="text-dark pr-2 pl-0" href="/myhotel">
              <h6 className="my-0"><strong><i className="fas fa-hotel" /> Hotel</strong></h6>
            </Button>
            <Button variant="link" className="text-dark pr-2 pl-0" href="/hotel/create">
              <h6 className="my-0"><strong><i className="fas fa-plus-square" /> Create</strong></h6>
            </Button>
          </div>
        </div>
      )
    } else if (this.state.pathname !== "/") {
      return (
        <>
          <Form onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
            <InputGroup>
              <Form.Control
                className="border-dark"
                type="text"
                onChange={(e) => this.setState({ search: { ...this.state.search, hotel_name: e.currentTarget.value } })}
                placeholder="Hotel or Destination"
                defaultValue={this.state.search.hotel_name}
                autoFocus />
              <InputGroup.Append>
                <Button type="submit" variant="dark"><i className="fas fa-search" /></Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        </>
      )
    }
  }

  getUserActions = () => {
    const currentUser = this.state.currentUser;
    const requests = currentUser ? requestService.getRequestOf(currentUser.user_id) : "";
    if (!currentUser) {
      return (
        <Nav className="">
          <Navbar.Text>sign in/sign up as:</Navbar.Text>
          <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={() => this.setState({ showModal: "signin_signup", type: "Traveler" })}>Traveler</Nav.Link>
          <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={() => this.setState({ showModal: "signin_signup", type: "Hotel Manager" })}>Hotel Manager</Nav.Link>
        </Nav>
      )
    } else if (currentUser.user_type === "traveler") {
      return (
        <>
          <Navbar.Text>signed in as Traveler:</Navbar.Text>
          <Dropdown className="mr-md-4 d-xs-sm-none d-sm-md-none">
            <Dropdown.Toggle bsPrefix="none" variant="link" className="text-dark bold">
              <Row className="align-items-center">
                <Col>{currentUser.username}</Col>
                <div className="d-inline-block circle-avatar icon" style={currentUser.img ? { backgroundImage: `url(${currentUser.img})` } : { backgroundColor: userService.getUserColor() }} />
              </Row>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item className="text-right" href="/reservation"><i className="fas fa-calendar-check" /> Reservation</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-right" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Dropdown.Item>
              <Dropdown.Item className="text-right" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Dropdown.Item>
              <Dropdown.Item className="text-right" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <strong className="d-md-none">{" " + currentUser.username}</strong>
          <Nav className="d-md-none">
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/reservation"><i className="fas fa-calendar-check" /> Reservation</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Nav.Link>
          </Nav>
        </>
      )
    } else if (currentUser.user_type === "hotel_manager") {
      return (
        <>
          <Navbar.Text>signed in as Hotel Manager:</Navbar.Text>
          <Dropdown className="mr-md-4 d-xs-sm-none d-sm-md-none">
            <Dropdown.Toggle bsPrefix="none" variant="link" className="text-dark bold">
              <Row className="align-items-center">
                <Col className={requests.length ? "text-danger" : ""}>
                  {currentUser.username}&nbsp;
                  {requests.length ? <Badge variant="danger">{requests.length}</Badge> : ""}
                </Col>
                <div className="d-inline-block circle-avatar icon" style={currentUser.img ? { backgroundImage: `url(${currentUser.img})` } : { backgroundColor: userService.getUserColor() }} />
              </Row>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item className="text-right bold" href="/myhotel"><i className="fas fa-hotel" /> My hotel</Dropdown.Item>
              <Dropdown.Item className="text-right bold" href="/hotel/create"><i className="fas fa-plus-square" /> Create hotel</Dropdown.Item>
              <Dropdown.Item className="text-right bold" href="/request">
                <div className={requests.length ? "text-danger" : ""}>
                  <i className="fas fa-file-import" />&nbsp;Request&nbsp;{requests.length ? <Badge variant="danger">{requests.length}</Badge> : ""}
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-right bold" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Dropdown.Item>
              <Dropdown.Item className="text-right bold" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Dropdown.Item>
              <Dropdown.Item className="text-right bold" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <strong className="d-md-none">{" " + currentUser.username}</strong>
          <Nav className="d-md-none">
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/myhotel"><i className="fas fa-hotel" /> My hotel</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/hotel/create"><i className="fas fa-plus-square" /> Create hotel</Nav.Link>
            <Nav.Link className="text-dark bold" href="/request">
              <div className={(requests.length ? "text-danger" : "") + " align-items-center ml-4 ml-md-0"}>
                <i className="fas fa-file-import" />&nbsp;Request&nbsp;{requests.length ? <Badge variant="danger">{requests.length}</Badge> : ""}
              </div>
            </Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Nav.Link>
          </Nav>
        </>
      )
    }
  }

  getSecondRowComponent = () => {
    if (this.state.pathname === "/search") {
      return (
        <>
          {
            !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
              <>
                <hr className="mx-0 my-3" />
                <Navbar.Text>date:</Navbar.Text>
                <Col xs={10} sm={8} md={3} lg={3} xl={3} className="my-2 my-md-0">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text className="bg-dark border-dark text-white">Check-in</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      className="border-dark"
                      type="date"
                      onChange={(e) => this.setState({ search: { ...this.state.search, checkin: e.currentTarget.value } })}
                      defaultValue={this.state.search.checkin}
                      required />
                  </InputGroup>
                </Col>
                <Col xs={10} sm={8} md={3} lg={3} xl={3} className="my-2 my-md-0 mr-auto">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text className="bg-dark border-dark text-white">Check-out</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      className="border-dark"
                      type="date"
                      onChange={(e) => this.setState({ search: { ...this.state.search, checkout: e.currentTarget.value } })}
                      defaultValue={this.state.search.checkout}
                      required />
                  </InputGroup>
                </Col>
              </>
              :
              <div className="d-xs-sm-none d-sm-md-none mx-auto">
                <Button variant="link" className="text-dark" href="/myhotel">
                  <h5 className="my-0"><strong><i className="fas fa-hotel" /> See my hotel</strong></h5>
                </Button>
                <Button variant="link" className="text-dark" href="/hotel/create">
                  <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create a new hotel</strong></h5>
                </Button>
              </div>
          }
          <hr className="mx-0 my-3" />
          <Navbar.Text>filter:</Navbar.Text>
          <div className="ml-2 my-2">
            <OverlayTrigger ref={ref => this.filterPrice = ref} trigger="manual" onExited={() => window.location.href = this.getSearchLink()} placement="bottom" overlay={
              <Popover className="text-dark">
                <h6><strong>Price per night</strong></h6>
                <br />
                <div className="mx-2">
                  <InputRange
                    minValue={this.props.priceRange.min}
                    maxValue={this.props.priceRange.max}
                    value={{
                      min: this.state.price.min,
                      max: this.state.price.max
                    }}
                    step={(this.props.priceRange.max - this.props.priceRange.min) / 10}
                    onChange={val => this.setState({ price: val })} />
                </div>
                <br />
                <Row>
                  <Col>MIN: ฿ {this.state.price.min}</Col>
                  <Col>MAX: ฿ {this.state.price.max}</Col>
                </Row>
                <br />
                <Button className="w-100" variant="dark" onClick={() => this.setState({ price: { min: this.props.priceRange.min, max: this.props.priceRange.max } })}><div className="fs-12">Clear</div></Button>
              </Popover>
            }>
              {
                this.state.price.min !== this.props.priceRange.min || this.state.price.max !== this.props.priceRange.max ?
                  <Button variant="dark" className="bold mx-2" onClick={() => { this.filterPrice.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-tag flip" />&nbsp;&nbsp;Price&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ price: { min: this.props.priceRange.min, max: this.props.priceRange.max } })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2" onClick={() => { this.filterPrice.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-tag flip" />&nbsp;&nbsp;Price&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
          <div className="ml-2 my-2">
            <OverlayTrigger ref={ref => this.filterRating = ref} trigger="manual" onExited={() => window.location.href = this.getSearchLink()} placement="bottom" overlay={
              <Popover className="text-dark">
                <h6><strong>Review rating</strong></h6>
                <div>At least:</div>
                <h4>
                  <i className={(this.state.showRating >= 1 ? "fas fa-star" : "far fa-star") + " text-dark"}
                    onClick={() => this.setState({ rating: this.state.showRating })}
                    onMouseEnter={() => this.setState({ showRating: 1 })}
                    onMouseLeave={() => this.setState({ showRating: this.state.rating })} />
                  <i className={(this.state.showRating >= 2 ? "fas fa-star" : "far fa-star") + " text-dark"}
                    onClick={() => this.setState({ rating: this.state.showRating })}
                    onMouseEnter={() => this.setState({ showRating: 2 })}
                    onMouseLeave={() => this.setState({ showRating: this.state.rating })} />
                  <i className={(this.state.showRating >= 3 ? "fas fa-star" : "far fa-star") + " text-dark"}
                    onClick={() => this.setState({ rating: this.state.showRating })}
                    onMouseEnter={() => this.setState({ showRating: 3 })}
                    onMouseLeave={() => this.setState({ showRating: this.state.rating })} />
                  <i className={(this.state.showRating >= 4 ? "fas fa-star" : "far fa-star") + " text-dark"}
                    onClick={() => this.setState({ rating: this.state.showRating })}
                    onMouseEnter={() => this.setState({ showRating: 4 })}
                    onMouseLeave={() => this.setState({ showRating: this.state.rating })} />
                  <i className={(this.state.showRating >= 5 ? "fas fa-star" : "far fa-star") + " text-dark"}
                    onClick={() => this.setState({ rating: this.state.showRating })}
                    onMouseEnter={() => this.setState({ showRating: 5 })}
                    onMouseLeave={() => this.setState({ showRating: this.state.rating })} />
                </h4>
                <br />
                <Button className="w-100" variant="dark" onClick={() => this.setState({ rating: 0, showRating: 0 })}><div className="fs-12">Clear</div></Button>
              </Popover>
            }>
              {
                this.state.rating !== 0 ?
                  <Button variant="dark" className="bold mx-2" onClick={() => { this.filterRating.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-star text-light" />&nbsp;&nbsp;Rating&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ rating: 0, showRating: 0 })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2" onClick={() => { this.filterRating.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-star text-dark" />&nbsp;&nbsp;Rating&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
          <div className="ml-2 my-2">
            <OverlayTrigger ref={ref => this.filterAmenities = ref} trigger="manual" onExited={() => window.location.href = this.getSearchLink()} placement="bottom" overlay={
              <Popover className="text-dark">
                <h6><strong>Property amenities</strong></h6>
                <Row noGutters>
                  <Col xs={4}
                    className="text-center my-2 bold"
                    onClick={() => this.toggleAmenitiesFilter(0)}>
                    <p dangerouslySetInnerHTML={{ __html: this.state.amenities[0] ? hotelService.amenities[0].tag : hotelService.amenities[1].tag }} />
                    {this.state.amenities[0] ? hotelService.amenities[0].name : hotelService.amenities[1].name}
                  </Col>
                  {
                    hotelService.amenities.slice(2, 13).map((amenity, idx) => {
                      return (
                        <Col xs={4}
                          className={"text-center my-2 " + (this.state.amenities[idx + 1] ? "text-dark bold" : "text-lightgray")}
                          onClick={() => this.toggleAmenitiesFilter(idx + 1)}>
                          <p dangerouslySetInnerHTML={{ __html: amenity.tag }} />
                          {amenity.name}
                        </Col>
                      )
                    })
                  }
                </Row>
                <br />
                <Button className="w-100" variant="dark" onClick={() => this.setState({ amenities: [] })}><div className="fs-12">Clear</div></Button>
              </Popover>
            }>
              {
                this.isAnyAmenitesChanged() ?
                  <Button variant="dark" className="bold mx-2" onClick={() => { this.filterAmenities.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-concierge-bell text-light" />&nbsp;&nbsp;Amenities&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ amenities: [] })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2" onClick={() => { this.filterAmenities.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-concierge-bell text-dark" />&nbsp;&nbsp;Amenities&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
        </>
      );
    } else if (this.state.pathname === "/hotel") {
      return (
        <>
          <hr className="mx-0 my-3" />
          <div className="d-md-none">
            <Navbar.Text>search:</Navbar.Text>
            <Col xs={10} sm={8}>
              <Form onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
                <InputGroup>
                  <Form.Control
                    className="border-dark"
                    type="text"
                    onChange={(e) => this.setState({ search: { ...this.state.search, hotel_name: e.currentTarget.value } })}
                    placeholder="Hotel or Destination"
                    defaultValue={this.state.search.hotel_name}
                    autoFocus />
                  <InputGroup.Append>
                    <Button type="submit" variant="dark"><i className="fas fa-search" /></Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
            </Col>
          </div>
          {
            !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
              <>
                <Navbar.Text>date:</Navbar.Text>
                <Col xs={10} sm={8} md={3} lg={3} xl={3} className="my-2 my-md-0">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text className="bg-dark border-dark text-white">Check-in</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      className="border-dark"
                      type="date"
                      onChange={(e) => this.setState({ search: { ...this.state.search, checkin: e.currentTarget.value } })}
                      onBlur={() => window.location.href = this.getHotelLink()}
                      defaultValue={this.state.search.checkin}
                      required />
                  </InputGroup>
                </Col>
                <Col xs={10} sm={8} md={3} lg={3} xl={3} className="my-2 my-md-0 mr-auto">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text className="bg-dark border-dark text-white">Check-out</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      className="border-dark"
                      type="date"
                      onChange={(e) => this.setState({ search: { ...this.state.search, checkout: e.currentTarget.value } })}
                      onBlur={() => window.location.href = this.getHotelLink()}
                      defaultValue={this.state.search.checkout}
                      required />
                  </InputGroup>
                </Col>
              </>
              :
              this.isUserOwn() ?
                <div className="mx-auto">
                  <hr className="mx-0 my-3 d-md-none" />
                  <div className="text-center">
                    {
                      this.props.mode === "view" ?
                        <Button variant="link" className="text-dark" onClick={e => { e.preventDefault(); this.props.toggleMode(); }}>
                          <h5 className="my-0"><strong><i className="fas fa-edit" /> Edit hotel</strong></h5>
                        </Button>
                        :
                        <Button type="submit" form="create-hotel" variant="link" className="text-success">
                          <h5 className="my-0"><strong><i className="fas fa-edit" /> Save changes</strong></h5>
                        </Button>
                    }
                    <Button variant="link" className="text-dark" href={this.getHotelReservationLink()}>
                      <h5 className="my-0"><strong><i className="fas fa-calendar-check" /> See reservation</strong></h5>
                    </Button>
                    <Button variant="link" className="text-dark" onClick={() => this.setState({ showModal: "cancel_management_confirm" })}>
                      <h5 className="my-0"><strong><i className="fas fa-window-close" /> Cancel management</strong></h5>
                    </Button>
                  </div>
                </div>
                :
                <div className="mx-auto">
                  <hr className="mx-0 my-3 d-md-none" />
                  <div className="text-center">
                    {
                      requestService.isRequestPending(this.state.search.hotel_id, this.state.currentUser.user_id) ?
                        <Button disabled variant="link" className="text-dark">
                          <h5 className="my-0"><strong><i className="fas fa-paper-plane" /> Request is pending</strong></h5>
                        </Button>
                        :
                        <Button variant="link" className="text-dark" onClick={() => this.setState({ showModal: "request_confirm" })}>
                          <h5 className="my-0"><strong><i className="fas fa-file-export" /> Request permission</strong></h5>
                        </Button>
                    }
                  </div>
                </div>
          }
          <div className="d-xs-sm-none d-sm-md-none">
            <Button variant="link"
              className="text-dark bold mx-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-info-circle" /> Info</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold mx-2"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-door-closed" /> Rooms</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold mx-2"
              onClick={() => document.querySelector('#hotel_reviews').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-comment-dots" /> Reviews</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold mx-2"
              onClick={() => document.querySelector('#hotel_managers').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-users" /> Managers</h6>
            </Button>
          </div>
        </>
      );
    }
  }
}
