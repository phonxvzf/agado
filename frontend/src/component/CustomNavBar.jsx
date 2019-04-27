import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import qs from 'qs';
import React, { Component } from 'react';
import { Badge, Button, Col, Dropdown, Form, Image, InputGroup, Nav, Navbar, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
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
  async componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const currentUser = userService.getCurrentUser();
    let hotel = null;
    if (search.hotel_id) {
      hotel = await hotelService.getHotel(search.hotel_id);
    }
    const requests = currentUser ? await requestService.getRequestOf() : "";
    const isRequestPending = currentUser && search.hotel_id ? await requestService.isRequestPending(Number(search.hotel_id), currentUser.user_id) : null;
    this.setState({
      pathname: pathname,
      search: search,
      currentUser: currentUser,
      hotel: hotel,
      requests: requests,
      isRequestPending: isRequestPending
    });

    this.loadPrice();
    this.loadRating();
    this.loadAmenities();
    this.loadSortBy();

    this.setState({
      loaded: true
    });
  }

  componentDidMount() {
    if (window.innerWidth <= 768 && window.location.pathname === "/hotel") {
      window.addEventListener('scroll', this.handleScroll, true);
    }
  }

  componentWillUnmount() {
    if (window.innerWidth <= 768 && window.location.pathname === "/hotel") {
      window.removeEventListener('scroll', this.handleScroll, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.priceRange.min !== -Infinity || nextProps.priceRange.max !== Infinity) {
      this.loadPrice(nextProps.priceRange);
    }
  }

  handleScroll = (e) => {
    const winScroll = e.target.scrollTop;
    const height = e.target.scrollHeight - e.target.clientHeight;
    const scrolled = (winScroll / height) * 100;
    this.setState({
      scrolled: scrolled,
      justScrolled: true
    });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.setState({
      justScrolled: false
    }), 1000);
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
      min_price: this.state.price.min === -Infinity ? null : this.state.price.min,
      max_price: this.state.price.max === Infinity ? null : this.state.price.max,
      rating: this.state.rating,
      amenities: this.getAmenitiesQs(),
      sort_by: this.state.sortBy
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
      hotel_id: Number(this.state.search.hotel_id),
      checkin: this.state.search.checkin,
      checkout: this.state.search.checkout
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelEditLink = () => {
    const pathname = "/hotel/edit";
    const search = qs.stringify({
      hotel_id: Number(this.state.search.hotel_id)
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  getHotelReservationLink = () => {
    const pathname = "/hotel/reservation";
    const search = qs.stringify({
      hotel_id: Number(this.state.search.hotel_id)
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  requestPermission = async () => {
    const request = {
      hotel_id: Number(this.state.search.hotel_id),
      user_id: this.state.currentUser.user_id
    }
    if (await requestService.createRequest(request)) {
      window.history.go();
    }
  }

  cancelMaagement = async () => {
    if (await hotelService.cancelManagement(Number(this.state.search.hotel_id), this.state.currentUser.user_id)) {
      window.location.href = "/myhotel";
    }
  }

  isUserOwn = () => {
    const hotel = this.state.hotel;
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

  loadSortBy = () => {
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      sortBy: search.sort_by ? search.sort_by : "price"
    })
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

  getDateString = () => {
    const checkin = this.state.search.checkin ? moment(this.state.search.checkin).format('D MMM YYYY') : "...";
    const checkout = this.state.search.checkout ? moment(this.state.search.checkout).format('D MMM YYYY') : "...";
    if (checkin === "..." && checkout === "...") {
      return "Check-in & Check-out";
    }
    return checkin + " - " + checkout;
  }

  render() {
    if (!this.state || !this.state.loaded) {
      return <></>;
    }
    return (
      <>
        <Navbar className="shadow pb-md-0 pt-md-2" bg="light" variant="light" fixed="top" expand="md" collapseOnSelect>
          <h3 className="text-center-fixed text-dark bold mb-4 d-xs-sm-none d-sm-md-none">
            {this.getTitle()}
          </h3>
          <Row className="align-items-center">
            <Col xs={2} className="d-md-none">
              <Navbar.Toggle />
            </Col>
            <Col xs={4} md={3} xl={2} className="ml-lg-3 px-0">
              <Navbar.Brand className="py-0 mx-0" href={this.state.currentUser && this.state.currentUser.user_type === "hotel_manager" ? "/myhotel" : "/"}>
                <Image src={agadoLogo} fluid />
              </Navbar.Brand>
            </Col>
            <Col className="mr-auto">
              {this.getSearchTab()}
            </Col>
            <Col xs={12} md={4} lg={5} xl={4} className="mr-lg-3">
              <Navbar.Collapse className="justify-content-end">
                {this.getUserActions()}
              </Navbar.Collapse>
            </Col>
            <Col xs={12}>
              <Navbar.Collapse className="mx-lg-3 mx-xl-5">
                {this.getSecondRowComponent()}
              </Navbar.Collapse>
            </Col>
            {/* <Col xs={12} className="px-0 pt-1">
              <ProgressBar className="scroll-indicator bg-none" variant="dark" now={this.state.scrolled} />
            </Col> */}
          </Row>
        </Navbar>
        <div className="d-md-none">
          {this.getFloatComponent()}
        </div>
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

  getTitle = () => {
    if (this.state.pathname === "/hotel/reservation") {
      return "Hotel's Reservation"
    } else if (this.state.pathname === "/myhotel") {
      return "My Hotel"
    } else if (this.state.pathname === "/request") {
      return "Request"
    } else if (this.state.pathname === "/payment") {
      return "Payment"
      // } else if (this.state.pathname === "/reservation") {
      //   return "Reservation"
    } else if (this.state.pathname === "/tutorial" && this.state.currentUser && this.state.currentUser.user_type === "hotel_manager") {
      return "Tutorial"
    } else if (this.state.pathname === "/profile" && this.state.currentUser && this.state.currentUser.user_type === "hotel_manager") {
      return "Profile"
    }
  }

  getSearchTab = () => {
    if (this.state.pathname === "/hotel") {
      return (
        <>
          <Row className="d-xs-sm-none d-sm-md-none">
            <Col xs={7}>
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
            <Col xs={5}>
              {
                !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                  <DateRangePicker
                    minDate={moment()}
                    startDate={moment(this.state.search.checkin)}
                    endDate={moment(this.state.search.checkout)}
                    autoApply
                    onApply={(e, picker) => {
                      e.preventDefault();
                      if (moment(picker.startDate).format('YYYY-MM-DD') === moment(picker.endDate).format('YYYY-MM-DD')) {
                        return;
                      }
                      this.state.search.checkin = moment(picker.startDate).format('YYYY-MM-DD');
                      this.state.search.checkout = moment(picker.endDate).format('YYYY-MM-DD');
                      window.location.href = this.getHotelLink();
                    }}>
                    <Form>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={this.getDateString()} />
                        <InputGroup.Append>
                          <Button variant="dark"><i className="fas fa-calendar-week" /></Button>
                        </InputGroup.Append>
                      </InputGroup>
                    </Form>
                  </DateRangePicker>
                  :
                  ""
              }
            </Col>
          </Row>
          <div className="text-right d-md-none">
            <Row noGutters>
              <Col>
                <Form inline onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
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
              {
                !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                  <div className="d-inline ml-1">
                    <DateRangePicker
                      minDate={moment()}
                      startDate={moment(this.state.search.checkin)}
                      endDate={moment(this.state.search.checkout)}
                      autoApply
                      onApply={(e, picker) => {
                        e.preventDefault();
                        if (moment(picker.startDate).format('YYYY-MM-DD') === moment(picker.endDate).format('YYYY-MM-DD')) {
                          return;
                        }
                        this.state.search.checkin = moment(picker.startDate).format('YYYY-MM-DD');
                        this.state.search.checkout = moment(picker.endDate).format('YYYY-MM-DD');
                        window.location.href = this.getHotelLink();
                      }}>
                      <Button variant="dark"><i className="fas fa-calendar-week" /></Button>
                    </DateRangePicker>
                  </div>
                  :
                  <div className="d-inline ml-1">
                    <Dropdown>
                      <Dropdown.Toggle bsPrefix="none" variant="dark">
                        <i className="fas fa-hotel" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="dropdown-menu-right large-dropdown">
                        {
                          this.isUserOwn() ?
                            <>
                              {
                                this.props.mode === "view" ?
                                  <Button variant="light" className="text-dark w-100 text-left" onClick={e => { e.preventDefault(); this.props.toggleMode(); }}>
                                    <h6 className="my-0 bold"><i className="fas fa-edit" /> Edit Hotel</h6>
                                  </Button>
                                  :
                                  <Button type="submit" form="create-hotel" variant="light" className="text-success w-100 text-left">
                                    <h6 className="my-0 bold"><i className="fas fa-save" /> Save Changes</h6>
                                  </Button>
                              }
                              <br />
                              <Button variant="light" className="text-dark w-100 text-left" href={this.getHotelReservationLink()}>
                                <h6 className="my-0 bold"><i className="fas fa-calendar-check" /> Reservation</h6>
                              </Button>
                              <br />
                              <Button variant="light" className="text-danger w-100 text-left" onClick={() => this.setState({ showModal: "cancel_management_confirm" })}>
                                <h6 className="my-0 bold"><i className="fas fa-window-close" /> Cancel Management</h6>
                              </Button>
                            </>
                            :
                            this.state.isRequestPending ?
                              <Button disabled variant="light" className="text-secondary w-100 text-left">
                                <h6 className="my-0 bold"><i className="fas fa-paper-plane" /> Request is pending</h6>
                              </Button>
                              :
                              <Button variant="light" className="text-success w-100 text-left" onClick={() => this.setState({ showModal: "request_confirm" })}>
                                <h6 className="my-0 bold"><i className="fas fa-file-export" /> Request permission</h6>
                              </Button>
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
              }
            </Row>
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
            {/* <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-info-circle" /> Info</h6>
            </Button>
            <Button variant="link"
              className="text-dark bold px-2"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h6 className="my-0"><i className="fas fa-door-closed" /> Rooms</h6>
            </Button> */}
          </div>
          <div className="text-right d-md-none">
            <Button type="submit" form="create-hotel" variant="link" className="text-dark pr-2 pl-0">
              <h5 className="my-0"><strong><i className="fas fa-plus-square" /> Create now</strong></h5>
            </Button>
            {/* <Button variant="link"
              className="text-dark bold pl-0 pr-2"
              onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-info-circle" /></h5>
            </Button>
            <Button variant="link"
              className="text-dark bold px-0"
              onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
              <h5 className="my-0"><i className="fas fa-door-closed" /></h5>
            </Button> */}
          </div>
        </div>
      )
    } else if (this.state.pathname === "/hotel/edit"
      && this.state.currentUser
      && this.state.currentUser.user_type === "hotel_manager"
      && this.state.hotel
      && this.state.hotel.manager.includes(this.state.currentUser.user_id)) {
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
              <h5 className="my-0"><strong><i className="fas fa-edit" /> Edit</strong></h5>
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
    } else if (this.state.pathname === "/hotel/reservation") {
      return (
        <div className="text-right d-md-none text-dark">
          <h5 className="my-0"><strong>Reservation</strong></h5>
        </div>
      )
    } else if (this.state.pathname === "/myhotel") {
      return (
        <div className="text-right d-md-none text-dark">
          <h5 className="my-0"><strong>My Hotel</strong></h5>
        </div>
      )
    } else if (this.state.pathname === "/request") {
      return (
        <div className="text-right d-md-none text-dark">
          <h5 className="my-0"><strong>Request</strong></h5>
        </div>
      )
    } else if (this.state.pathname === "/payment") {
      return (
        <div className="text-right d-md-none text-dark">
          <h6 className="my-0 bold">Payment</h6>
        </div>
      )
      // } else if (this.state.pathname === "/reservation") {
      //   return (
      //     <div className="text-right d-md-none text-dark">
      //       <h5 className="my-0"><strong>Reservation</strong></h5>
      //     </div>
      //   )
    } else if (this.state.pathname === "/tutorial" && this.state.currentUser && this.state.currentUser.user_type === "hotel_manager") {
      return (
        <div className="text-right d-md-none text-dark">
          <h5 className="my-0"><strong>Tutorial</strong></h5>
        </div>
      )
    } else if (this.state.pathname === "/profile" && this.state.currentUser && this.state.currentUser.user_type === "hotel_manager") {
      return (
        <div className="text-right d-md-none text-dark">
          <h5 className="my-0"><strong>Profile</strong></h5>
        </div>
      )
    } else if (this.state.pathname !== "/") {
      return (
        <>
          <Row className="d-xs-sm-none d-sm-md-none">
            <Col xs={7}>
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
            {
              !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                <Col xs={5}>
                  <DateRangePicker
                    minDate={moment()}
                    startDate={moment(this.state.search.checkin)}
                    endDate={moment(this.state.search.checkout)}
                    autoApply
                    onApply={(e, picker) => {
                      e.preventDefault();
                      if (moment(picker.startDate).format('YYYY-MM-DD') === moment(picker.endDate).format('YYYY-MM-DD')) {
                        return;
                      }
                      this.state.search.checkin = moment(picker.startDate).format('YYYY-MM-DD');
                      this.state.search.checkout = moment(picker.endDate).format('YYYY-MM-DD');
                      window.location.href = this.getSearchLink();
                    }}>
                    <Form>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={this.getDateString()} />
                        <InputGroup.Append>
                          <Button variant="dark"><i className="fas fa-calendar-week" /></Button>
                        </InputGroup.Append>
                      </InputGroup>
                    </Form>
                  </DateRangePicker>
                </Col>
                :
                ""
            }
          </Row>
          <div className="text-right d-md-none">
            <Row noGutters>
              <Col>
                <Form inline onSubmit={(e) => { e.preventDefault(); window.location.href = this.getSearchLink(); }}>
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
              {
                !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                  <div className="d-inline ml-1">
                    <DateRangePicker
                      minDate={moment()}
                      startDate={moment(this.state.search.checkin)}
                      endDate={moment(this.state.search.checkout)}
                      autoApply
                      onApply={(e, picker) => {
                        e.preventDefault();
                        if (moment(picker.startDate).format('YYYY-MM-DD') === moment(picker.endDate).format('YYYY-MM-DD')) {
                          return;
                        }
                        this.state.search.checkin = moment(picker.startDate).format('YYYY-MM-DD');
                        this.state.search.checkout = moment(picker.endDate).format('YYYY-MM-DD');
                        window.location.href = this.getSearchLink();
                      }}>
                      <Button variant="dark"><i className="fas fa-calendar-week" /></Button>
                    </DateRangePicker>
                  </div>
                  :
                  ""
              }
            </Row>
          </div>
        </>
      )
    }
  }

  getUserActions = () => {
    const currentUser = this.state.currentUser;
    const requests = this.state.requests;
    if (!currentUser) {
      return (
        <Nav className="">
          <Navbar.Text>Sign in/sign up as:</Navbar.Text>
          <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={() => this.setState({ showModal: "signin_signup", type: "Traveler" })}>Traveler</Nav.Link>
          <Navbar.Text className="d-xs-sm-none d-sm-md-none">or</Navbar.Text>
          <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={() => this.setState({ showModal: "signin_signup", type: "Hotel Manager" })}>Hotel Manager</Nav.Link>
        </Nav>
      )
    } else if (currentUser.user_type === "traveler") {
      return (
        <>
          <Navbar.Text>Signed in as Traveler:</Navbar.Text>
          <Dropdown className="mr-md-4 d-xs-sm-none d-sm-md-none">
            <Dropdown.Toggle bsPrefix="none" variant="link" className="text-dark bold">
              <Row className="align-items-center">
                <Col>{currentUser.username}</Col>
                <div className="d-inline-block circle-avatar icon" style={currentUser.img ? { backgroundImage: `url(${currentUser.img})` } : { backgroundColor: userService.getUserColor() }} />
              </Row>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item className="text-left pl-2 bold" href="/reservation"><i className="fas fa-calendar-check" /> Reservation</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-left pl-2 bold" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <strong className="d-md-none">{" " + currentUser.username}</strong>
          <Nav className="d-md-none">
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/reservation"><i className="fas fa-calendar-check" /> Reservation</Nav.Link>
            <hr className="mx-0 my-1" />
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Nav.Link>
            <Nav.Link className="text-dark bold ml-4 ml-md-0" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Nav.Link>
          </Nav>
        </>
      )
    } else if (currentUser.user_type === "hotel_manager") {
      return (
        <>
          <Navbar.Text>Signed in as Hotel Manager:</Navbar.Text>
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
              <Dropdown.Item className="text-left pl-2 bold" href="/myhotel"><i className="fas fa-hotel" /> My hotel</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" href="/hotel/create"><i className="fas fa-plus-square" /> Create hotel</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" href="/request">
                <div className={requests.length ? "text-danger" : ""}>
                  <i className="fas fa-file-import" />&nbsp;Request&nbsp;{requests.length ? <Badge variant="danger">{requests.length}</Badge> : ""}
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-left pl-2 bold" href="/tutorial"><i className="fab fa-leanpub" /> Tutorial</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" href={this.getProfileLink()}><i className="fas fa-user-alt" /> Profile</Dropdown.Item>
              <Dropdown.Item className="text-left pl-2 bold" onClick={userService.signout}><i className="fas fa-sign-out-alt" /> Sign out</Dropdown.Item>
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
            <hr className="mx-0 my-1" />
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
          <hr className="mx-0 my-3" />
          <Navbar.Text>filter:</Navbar.Text>
          <div className="my-2">
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
                (this.props.priceRange.min !== Infinity && this.props.priceRange.max !== Infinity) &&
                  (this.state.price.min !== this.props.priceRange.min || this.state.price.max !== this.props.priceRange.max) ?
                  <Button variant="dark" className="bold mx-2 text-light" onClick={() => { this.filterPrice.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-tag flip" />&nbsp;&nbsp;Price&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ price: { min: this.props.priceRange.min, max: this.props.priceRange.max } })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2 text-dark" onClick={() => { this.filterPrice.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-tag flip" />&nbsp;&nbsp;Price&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
          <div className="my-2">
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
                  <Button variant="dark" className="bold mx-2 text-light" onClick={() => { this.filterRating.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-star text-light" />&nbsp;&nbsp;Rating&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ rating: 0, showRating: 0 })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2 text-dark" onClick={() => { this.filterRating.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-star text-dark" />&nbsp;&nbsp;Rating&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
          <div className="my-2">
            <OverlayTrigger ref={ref => this.filterAmenities = ref} trigger="manual" onExited={() => window.location.href = this.getSearchLink()} placement="bottom" overlay={
              <Popover className="text-dark">
                <h6><strong>Property amenities</strong></h6>
                <Row noGutters>
                  <Col xs={4}>
                    <Button
                      variant="light"
                      className="room-card-amenity text-center px-0 py-0 my-2 bold text-dark"
                      onClick={() => this.toggleAmenitiesFilter(0)}>
                      <p dangerouslySetInnerHTML={{ __html: this.state.amenities[0] ? hotelService.amenities[0].tag : hotelService.amenities[1].tag }} />
                      {this.state.amenities[0] ? <>{hotelService.amenities[0].name}<br />&nbsp;&nbsp;&nbsp;</> : hotelService.amenities[1].name}
                    </Button>
                  </Col>
                  {
                    hotelService.amenities.slice(2, 13).map((amenity, idx) => {
                      return (
                        <Col xs={4}>
                          <Button
                            variant="light"
                            className={"room-card-amenity text-center px-0 py-0 my-2 bold" + (this.state.amenities[idx + 1] ? " text-dark" : " text-lightgray")}
                            onClick={() => this.toggleAmenitiesFilter(idx + 1)}>
                            <p dangerouslySetInnerHTML={{ __html: amenity.tag }} />
                            {amenity.name}{amenity.name.length <= 9 ? <><br />&nbsp;&nbsp;&nbsp;</> : ""}
                          </Button>
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
                  <Button variant="dark" className="bold mx-2 text-light" onClick={() => { this.filterAmenities.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-concierge-bell text-light" />&nbsp;&nbsp;Amenities&nbsp;&nbsp;<i className="fas fa-times-circle" onClick={() => this.setState({ amenities: [] })} />
                  </Button>
                  :
                  <Button variant="light" className="bold mx-2 text-dark" onClick={() => { this.filterAmenities.show(); this.setState({ showFilter: true }); }}>
                    <i className="fas fa-concierge-bell text-dark" />&nbsp;&nbsp;Amenities&nbsp;&nbsp;<i className="fas fa-caret-down" />
                  </Button>
              }
            </OverlayTrigger>
          </div>
          <Navbar.Text className="ml-md-5">sort by:</Navbar.Text>
          <div>
            <Button variant="light" className={"mx-2 my-2 text-dark bold" + (this.state.sortBy === "price" ? " highlight" : "")} onClick={() => { this.state.sortBy = "price"; window.location.href = this.getSearchLink(); }}><i className="fas fa-coins" />&nbsp;&nbsp;LOWEST PRICE FIRST</Button>
          </div>
          <div>
            <Button variant="light" className={"mx-2 my-2 text-dark bold" + (this.state.sortBy === "rating" ? " highlight" : "")} onClick={() => { this.state.sortBy = "rating"; window.location.href = this.getSearchLink(); }}><i className="fas fa-award" />&nbsp;&nbsp;TOP RATING</Button>
          </div>
        </>
      );
    } else if (this.state.pathname === "/hotel") {
      if (!this.state.hotel) {
        return <></>;
      }
      return (
        <>
          {/* <hr className="mx-0 my-3" />
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
            {
              !this.state.currentUser || this.state.currentUser.user_type === "traveler" ?
                <Col xs={10} sm={8} className="my-2 my-md-0">
                  <DateRangePicker
                    minDate={moment()}
                    startDate={moment(this.state.search.checkin)}
                    endDate={moment(this.state.search.checkout)}
                    autoApply
                    onApply={(e, picker) => {
                      e.preventDefault();
                      this.state.search.checkin = moment(picker.startDate).format('YYYY-MM-DD');
                      this.state.search.checkout = moment(picker.endDate).format('YYYY-MM-DD');
                      window.location.href = this.getHotelLink();
                    }}>
                    <Form>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={this.getDateString()} />
                        <InputGroup.Append>
                          <Button variant="dark"><i className="fas fa-calendar-week" /></Button>
                        </InputGroup.Append>
                      </InputGroup>
                    </Form>
                  </DateRangePicker>
                </Col>
                :
                this.isUserOwn() ?
                  <div className="mx-auto">
                    <hr className="mx-0 my-3 d-md-none" />
                    <div className="text-center">
                      {
                        this.props.mode === "view" ?
                          <Button variant="link" className="text-dark" onClick={e => { e.preventDefault(); this.props.toggleMode(); }}>
                            <h6 className="my-0 bold"><i className="fas fa-edit" /> Edit hotel</h6>
                          </Button>
                          :
                          <Button type="submit" form="create-hotel" variant="link" className="text-success">
                            <h6 className="my-0 bold"><i className="fas fa-save" /> Save changes</h6>
                          </Button>
                      }
                      <Button variant="link" className="text-dark" href={this.getHotelReservationLink()}>
                        <h6 className="my-0 bold"><i className="fas fa-calendar-check" /> See reservation</h6>
                      </Button>
                      <Button variant="link" className="text-danger" onClick={() => this.setState({ showModal: "cancel_management_confirm" })}>
                        <h6 className="my-0 bold"><i className="fas fa-window-close" /> Cancel management</h6>
                      </Button>
                    </div>
                  </div>
                  :
                  <div className="mx-auto">
                    <hr className="mx-0 my-3 d-md-none" />
                    <div className="text-center">
                      {
                        this.state.isRequestPending ?
                          <Button disabled variant="link" className="text-secondary">
                            <h6 className="my-0 bold"><i className="fas fa-paper-plane" /> Request is pending</h6>
                          </Button>
                          :
                          <Button variant="link" className="text-success" onClick={() => this.setState({ showModal: "request_confirm" })}>
                            <h6 className="my-0 bold"><i className="fas fa-file-export" /> Request permission</h6>
                          </Button>
                      }
                    </div>
                  </div>
            }
          </div> */}
          <Row className="d-xs-sm-none d-sm-md-none w-100 align-items-end">
            <>
              <Button variant="link"
                className="text-dark bold mx-xl-2"
                onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
                <h6 className="my-0"><i className="fas fa-info-circle" /> Info</h6>
              </Button>
              <Button variant="link"
                className="text-dark bold mx-xl-2"
                onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
                <h6 className="my-0"><i className="fas fa-door-closed" /> Rooms</h6>
              </Button>
              <Button variant="link"
                className="text-dark bold mx-xl-2 review-btn"
                onClick={() => document.querySelector('#hotel_reviews').scrollIntoView({ behavior: 'smooth' })}>
                <h6 className="my-0"><i className="fas fa-comment-dots" /> Reviews</h6>
              </Button>
              <Button variant="link"
                className="text-dark bold mx-xl-2"
                onClick={() => document.querySelector('#hotel_managers').scrollIntoView({ behavior: 'smooth' })}>
                <h6 className="my-0"><i className="fas fa-users" /> Managers</h6>
              </Button>
            </>
            {
              !this.state.currentUser || this.state.currentUser.user_type === "traveler" ? "" :
                this.isUserOwn() ?
                  <Col className="text-right">
                    {
                      this.props.mode === "view" ?
                        <Button variant="link" className="text-dark" onClick={e => { e.preventDefault(); this.props.toggleMode(); }}>
                          <h6 className="my-0 bold"><i className="fas fa-edit" /> Edit Hotel</h6>
                        </Button>
                        :
                        <Button type="submit" form="create-hotel" variant="link" className="text-success">
                          <h6 className="my-0 bold"><i className="fas fa-save" /> Save Changes</h6>
                        </Button>
                    }
                    <Button variant="link" className="text-dark" href={this.getHotelReservationLink()}>
                      <h6 className="my-0 bold"><i className="fas fa-calendar-check" /> Reservation</h6>
                    </Button>
                    <Button variant="link" className="text-danger" onClick={() => this.setState({ showModal: "cancel_management_confirm" })}>
                      <h6 className="my-0 bold"><i className="fas fa-window-close" /> Cancel Management</h6>
                    </Button>
                  </Col>
                  :
                  <Col className="text-center">
                    {
                      this.state.isRequestPending ?
                        <Button disabled variant="link" className="text-secondary">
                          <h6 className="my-0 bold"><i className="fas fa-paper-plane" /> Request is pending</h6>
                        </Button>
                        :
                        <Button variant="link" className="text-success" onClick={() => this.setState({ showModal: "request_confirm" })}>
                          <h6 className="my-0 bold"><i className="fas fa-file-export" /> Request permission</h6>
                        </Button>
                    }
                  </Col>
            }
          </Row>
        </>
      );
    }
  }

  getFloatComponent = () => {
    if (this.state.pathname === "/hotel") {
      return (
        <div className={"float-icon" + (this.state.justScrolled ? " " : " hide")}>
          <Button variant="dark"
            className="bold"
            onClick={() => document.querySelector('#hotel_info').scrollIntoView({ behavior: 'smooth' })}>
            <i className="fas fa-info-circle" />
          </Button>
          <br />
          <Button variant="dark"
            className="bold"
            onClick={() => document.querySelector('#hotel_rooms').scrollIntoView({ behavior: 'smooth' })}>
            <i className="fas fa-door-closed" />
          </Button>
          <br />
          <Button variant="dark"
            className="bold"
            onClick={() => document.querySelector('#hotel_reviews').scrollIntoView({ behavior: 'smooth' })}>
            <i className="fas fa-comment-dots" />
          </Button>
          <br />
          <Button variant="dark"
            onClick={() => document.querySelector('#hotel_managers').scrollIntoView({ behavior: 'smooth' })}>
            <i className="fas fa-users" />
          </Button>
        </div>
      )
    }
  }
}
