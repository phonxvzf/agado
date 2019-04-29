import qs from 'qs';
import React, { Component } from 'react';
import { Button, Col, Form, Image, Row } from 'react-bootstrap';
import CustomModal from '../component/CustomModal';
import NewRoomCard from '../component/NewRoomCard';
import '../css/CreateHotel.css';
import { hotelService } from '../service/hotelService';
import { userService } from '../service/userService';

export default class CreateHotel extends Component {
  componentWillMount() {
    if (window.location.pathname === "/hotel") {
      const hotel = this.props.hotel;
      if (hotel && hotel.managers.includes(this.props.currentUser.user_id)) {
        this.setState({
          validUser: true,
          hotel: hotel,
          action: "edit"
        });
      } else {
        this.setState({ validUser: false });
      }
    } else if (window.location.pathname === "/hotel/create") {
      const currentUser = userService.getCurrentUser();
      this.setState({
        validUser: currentUser && currentUser.user_type === "hotel_manager",
        hotel: {
          name: "",
          city: "",
          address: "",
          desc: "",
          imgs: ["", "", "", "", ""],
          rooms: [],
          managers: []
        },
        action: "create",
        currentUser: currentUser
      });
    }
  }

  getImgUrl = (img) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(img);
    });
  }

  uploadImg = (e, idx) => {
    const img = e.currentTarget.files[0];
    if (!img) {
      return;
    }
    if (!img.type.startsWith("image/")) {
      this.setState({
        showModal: "upload_not_img"
      })
      return;
    }
    if (img.size > 2000000) {
      this.setState({
        showModal: "upload_large_img"
      })
      return;
    }
    this.getImgUrl(img).then(imgUrl => {
      let imgs = this.state.hotel.imgs;
      imgs[idx - 1] = imgUrl;
      this.setState({ hotel: { ...this.state.hotel, imgs: imgs } });
    });
  }

  isValid = () => {
    const hotel = this.state.hotel;
    return hotel.name && hotel.city && hotel.address && hotel.desc;
  }

  checkForm = (e) => {
    e.preventDefault();
    if (e.target.id !== "create-hotel") {
      return;
    }
    if (this.isValid()) {
      if (this.state.action === "create") {
        this.setState({ check: false, showModal: "create_hotel_confirm" });
      } else if (this.state.action === "edit") {
        // this.setState({ check: false, showModal: "edit_hotel_confirm" });
        this.editHotel();
      }
    } else {
      this.setState({ check: true, showModal: "form_invalid" });
    }
  }

  createHotel = async () => {
    this.props.setPreventLeavePage(false);
    let hotel = this.state.hotel;
    hotel.managers = [this.state.currentUser.user_id];
    if (await hotelService.createHotel(hotel)) {
      window.location.href = "/myhotel";
      // this.setState({ showModal: "create_hotel_completed" });
    }
  }

  editHotel = async () => {
    this.props.setPreventLeavePage(false);
    const hotel = this.state.hotel;
    if (await hotelService.editHotel(hotel)) {
      // this.setState({ showModal: "edit_hotel_completed" });
      window.location.href = this.getHotelLink()
    }
  }

  getHotelLink = () => {
    const pathname = "/hotel";
    const search = qs.stringify({
      hotel_id: Number(this.props.search.hotel_id)
    }, { addQueryPrefix: true });
    return pathname + search;
  }

  deleteImg = (idx) => {
    const hotel = this.state.hotel;
    let imgs = hotel.imgs;
    imgs[idx] = null;
    this.setState({
      hotel: {
        ...hotel,
        imgs: imgs
      }
    });
  }

  render() {
    const hotel = this.state.hotel;
    if (!this.state.validUser) {
      return (
        <div className="error-bg px-auto hotel-info scroll-snap-child">
          <h1>Permission denied</h1>
          <h4>You have to be a Hotel manager to access this page.</h4>
        </div>
      )
    }
    return (
      <>
        <div className={window.location.pathname === "/hotel/create" ? "hotel-bg px-auto hotel-info" : ""}>
          <Row className="shadow scroll-snap-child" noGutters>
            <Col xs={12} sm={6}>
              <div className="ratio4-3">
                <input className="d-none" ref={ref => this.upimg1 = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, 1)} type="file" />
                {hotel.imgs[0] ? <Image className="absolute" src={hotel.imgs[0]} fluid /> : ""}
                <Button variant="dark" className={"abs-center border-none" + (hotel.imgs[0] ? " bg-fade text-none" : "")} onClick={() => this.upimg1.click()}>
                  <h1 className="my-0"><i className="fas fa-images" /></h1>
                </Button>
                <Button variant="dark" className={"abs-top-right border-none" + (hotel.imgs[0] ? " bg-fade" : " d-none")}
                  onClick={() => this.deleteImg(0)}>
                  <h4 className="my-0"><i className="fas fa-times" /></h4>
                </Button>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <Row noGutters>
                <Col>
                  <div className="ratio4-3">
                    <input className="d-none" ref={ref => this.upimg2 = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, 2)} type="file" />
                    {hotel.imgs[1] ? <Image className="absolute" src={hotel.imgs[1]} fluid /> : ""}
                    <Button variant="dark" className={"abs-center border-none" + (hotel.imgs[1] ? " bg-fade text-none" : "")} onClick={() => this.upimg2.click()}>
                      <h1 className="my-0"><i className="fas fa-images" /></h1>
                    </Button>
                    <Button variant="dark" className={"abs-top-right border-none" + (hotel.imgs[1] ? " bg-fade" : " d-none")}
                      onClick={() => this.deleteImg(1)}>
                      <h4 className="my-0"><i className="fas fa-times" /></h4>
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="ratio4-3">
                    <input className="d-none" ref={ref => this.upimg3 = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, 3)} type="file" />
                    {hotel.imgs[2] ? <Image className="absolute" src={hotel.imgs[2]} fluid /> : ""}
                    <Button variant="dark" className={"abs-center border-none" + (hotel.imgs[2] ? " bg-fade text-none" : "")} onClick={() => this.upimg3.click()}>
                      <h1 className="my-0"><i className="fas fa-images" /></h1>
                    </Button>
                    <Button variant="dark" className={"abs-top-right border-none" + (hotel.imgs[2] ? " bg-fade" : " d-none")}
                      onClick={() => this.deleteImg(2)}>
                      <h4 className="my-0"><i className="fas fa-times" /></h4>
                    </Button>
                  </div>
                </Col>
              </Row>
              <Row noGutters>
                <Col>
                  <div className="ratio4-3">
                    <input className="d-none" ref={ref => this.upimg4 = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, 4)} type="file" />
                    {hotel.imgs[3] ? <Image className="absolute" src={hotel.imgs[3]} fluid /> : ""}
                    <Button variant="dark" className={"abs-center border-none" + (hotel.imgs[3] ? " bg-fade text-none" : "")} onClick={() => this.upimg4.click()}>
                      <h1 className="my-0"><i className="fas fa-images" /></h1>
                    </Button>
                    <Button variant="dark" className={"abs-top-right border-none" + (hotel.imgs[3] ? " bg-fade" : " d-none")}
                      onClick={() => this.deleteImg(3)}>
                      <h4 className="my-0"><i className="fas fa-times" /></h4>
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="ratio4-3">
                    <input className="d-none" ref={ref => this.upimg5 = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, 5)} type="file" />
                    {hotel.imgs[4] ? <Image className="absolute" src={hotel.imgs[4]} fluid /> : ""}
                    <Button variant="dark" className={"abs-center border-none" + (hotel.imgs[4] ? " bg-fade text-none" : "")} onClick={() => this.upimg5.click()}>
                      <h1 className="my-0"><i className="fas fa-images" /></h1>
                    </Button>
                    <Button variant="dark" className={"abs-top-right border-none" + (hotel.imgs[4] ? " bg-fade" : " d-none")}
                      onClick={() => this.deleteImg(4)}>
                      <h4 className="my-0"><i className="fas fa-times" /></h4>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Form id="create-hotel" onSubmit={this.checkForm}>
            <div className="px-content mt-5 scroll-snap-child" id="hotel_info">
              <div className="position-relative">
                <Form.Control
                  type="text"
                  className="custom-form-control w-50 h1 bold-500"
                  onChange={(e) => this.setState({ hotel: { ...hotel, name: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder=" "
                  defaultValue={hotel.name}
                  autoFocus
                  required />
                <span className="hotel-name h1">Hotel's name</span>
              </div>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  className="custom-form-control w-50 h2 bold-500"
                  onChange={(e) => this.setState({ hotel: { ...hotel, city: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder=" "
                  defaultValue={hotel.city}
                  required />
                <span className="hotel-city h2">City</span>
              </div>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  className="custom-form-control w-75 h3"
                  onChange={(e) => this.setState({ hotel: { ...hotel, address: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder=" "
                  defaultValue={hotel.address}
                  required />
                <span className="hotel-addr h3">Address</span>
              </div>
              <div className="position-relative">
                <Form.Control
                  as="textarea"
                  rows={3}
                  className="custom-form-control w-100 h3"
                  onChange={(e) => this.setState({ hotel: { ...hotel, desc: e.currentTarget.value } })}
                  onClick={() => this.setState({ focus: "desc" })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder=" "
                  defaultValue={hotel.desc}
                  required />
                <span className={"hotel-desc h3 " +
                  (this.state.hotel.desc ? "medium" :
                    this.state.focus === "desc" ? "small" : "")}>
                  Description
                </span>
              </div>
              {/* <h3 className="d-inline" onClick={() => this.setState({ focus: "name" })}>{hotel.name ? hotel.name : "Hotel's name"}</h3>
              <Button variant="link" className="text-dark px-0 align-top" onClick={() => this.setState({ focus: "name" })}>
                &nbsp;<i className="fas fa-edit" />
              </Button>
              {this.state.focus === "name" || this.state.check ?
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ hotel: { ...hotel, name: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder="Hotel's name"
                  defaultValue={hotel.name}
                  autoFocus
                  required /> : ""}
              <h5 className="d-inline" onClick={() => this.setState({ focus: "city" })}>{hotel.city ? hotel.city : "City"}</h5>
              <Button variant="link" className="text-dark px-0 py-0 align-top" onClick={() => this.setState({ focus: "city" })}>
                &nbsp;<i className="fas fa-edit" />
              </Button>
              {this.state.focus === "city" || this.state.check ?
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ hotel: { ...hotel, city: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder="City"
                  defaultValue={hotel.city}
                  autoFocus
                  required /> : ""}
              <br />
              <hr />
              <span className="fs-18">
                <span onClick={() => this.setState({ focus: "address" })}>
                  <i className="fas fa-map-marker-alt" />
                  &nbsp;{hotel.address ? hotel.address : "Address"}
                </span>
                <Button variant="link" className="text-dark px-0 py-0 align-top" onClick={() => this.setState({ focus: "address" })}>
                  &nbsp;<i className="fas fa-edit" />
                </Button>
              </span>
              {this.state.focus === "address" || this.state.check ?
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ hotel: { ...hotel, address: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder="Address"
                  defaultValue={hotel.address}
                  autoFocus
                  required /> : ""}
              <br />
              <span className="fs-18 break-all-word">
                <span onClick={() => this.setState({ focus: "desc" })}>
                  <i className="fas fa-file-alt" onClick={() => this.setState({ focus: "desc" })} />
                  &nbsp;{hotel.desc ? hotel.desc : "Description"}
                </span>
                <Button variant="link" className="text-dark px-0 py-0 align-top" onClick={() => this.setState({ focus: "desc" })}>
                  &nbsp;<i className="fas fa-edit" />
                </Button>
                <br />
              </span>
              {this.state.focus === "desc" || this.state.check ?
                <Form.Control
                  as="textarea"
                  rows="3"
                  onChange={(e) => this.setState({ hotel: { ...hotel, desc: e.currentTarget.value } })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder="Description"
                  defaultValue={hotel.desc}
                  autoFocus
                  required /> : ""} */}
              <hr className="mb-5" />
            </div>
            <div id="hotel_rooms" className="mb-5">
              <div>
                <h3 className="scroll-snap-child px-content bold">Rooms</h3>
                {/* <ItemsCarousel
                  className="scroll-snap-child"
                  freeScrolling
                  numberOfCards={1}
                  gutter={-0.05 * window.innerWidth}> */}
                  {
                    hotel.rooms.map((room, idx) => {
                      return (
                        <Row className="my-4 mx-1 scroll-snap-child px-content">
                          <NewRoomCard room={room}
                            idx={idx}
                            setRoom={(idx, room) => {
                              let rooms = JSON.parse(JSON.stringify(hotel.rooms));
                              rooms[idx] = room;
                              this.setState({ hotel: { ...hotel, rooms: rooms } });
                            }}
                            deleteRoom={(idx) => {
                              let rooms = JSON.parse(JSON.stringify(hotel.rooms));
                              rooms.splice(idx, 1);
                              this.setState({ hotel: { ...hotel, rooms: rooms } });
                            }} />
                        </Row>
                      );
                    }).concat(
                      <Row className="my-4 mx-1 scroll-snap-child px-content">
                        <NewRoomCard
                          addNewRoom={(room) => {
                            let rooms = JSON.parse(JSON.stringify(hotel.rooms));
                            rooms.push(room);
                            this.setState({ hotel: { ...hotel, rooms: rooms } });
                          }} />
                      </Row>
                    )
                  }
                {/* </ItemsCarousel> */}
              </div>
            </div>
          </Form>
          <hr className="mb-5" />
        </div>
        <CustomModal
          showModal={this.state.showModal === "form_invalid"}
          closeModal={() => this.setState({ showModal: null })}
          title="Hotel's information is invalid"
          body="Please check your hotel's information again. All of the information is required." />
        <CustomModal
          showModal={this.state.showModal === "create_hotel_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Please confirm to create this hotel"
          body="You will can edit or delete the information later but the hotel's information will be published immediately."
          footer={
            <Button variant="success" onClick={this.createHotel}>Confirm</Button>
          } />
        <CustomModal
          showModal={this.state.showModal === "create_hotel_completed"}
          closeModal={() => window.location.href = "/myhotel"}
          title="Create hotel completed"
          body="Your hotel is published and you are manager of this hotel from now on. You can also edit or delete this hotel later." />
        <CustomModal
          showModal={this.state.showModal === "edit_hotel_confirm"}
          closeModal={() => this.setState({ showModal: null })}
          title="Please confirm to edit this hotel"
          body="The previous information of this hotel will be gone but you can edit or delete it later."
          footer={
            <Button variant="success" onClick={this.editHotel}>Confirm</Button>
          } />
        <CustomModal
          showModal={this.state.showModal === "edit_hotel_completed"}
          closeModal={() => window.location.href = this.getHotelLink()}
          title="Edit hotel completed"
          body="The hotel's information is changed now. You can also edit or delete this hotel later." />
        <CustomModal
          showModal={this.state.showModal === "upload_not_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="This file is not an image. " />
        <CustomModal
          showModal={this.state.showModal === "upload_large_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="The file size exceeds the limit of 2 MB." />
      </>
    )
  }
}
