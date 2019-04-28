import React, { Component } from 'react';
import { Badge, Button, Card, Carousel, Col, Collapse, Form, Image, Row } from 'react-bootstrap';
import { hotelService } from '../service/hotelService';
import CustomModal from './CustomModal';

export default class NewRoomCard extends Component {
  componentWillMount() {
    this.upimgs = [];
    this.resetRoom();
  }

  componentWillReceiveProps() {
    if (this.state.room) {
      this.resetRoom();
    }
  }

  resetRoom = () => {
    this.setState({
      room: {
        name: "",
        imgs: [],
        num_bed: 1,
        max_person: 1,
        price: 0,
        available_room: 1,
        total_room: 1,
        amenities: [1]
      },
      edit: true
    });
  }

  onChange = (room) => {
    if (!this.props.room) {
      this.setState({
        room: room
      });
    } else {
      this.props.setRoom(this.props.idx, room);
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
    if (img.size > 5000000) {
      this.setState({
        showModal: "upload_large_img"
      })
      return;
    }
    this.getImgUrl(img).then(imgUrl => {
      if (this.props.room) {
        let imgs = JSON.parse(JSON.stringify(this.props.room.imgs));
        imgs[idx] = imgUrl;
        this.props.setRoom(this.props.idx, { ...this.props.room, imgs: imgs });
      } else {
        let imgs = JSON.parse(JSON.stringify(this.state.room.imgs));
        imgs[idx] = imgUrl;
        this.setState({
          room: {
            ...this.state.room,
            imgs: imgs
          }
        });
      }
    });
  }

  deleteImg = (idx) => {
    this.upimgs.splice(idx, 1);
    if (this.props.room) {
      let imgs = JSON.parse(JSON.stringify(this.props.room.imgs));
      imgs.splice(idx, 1);
      this.props.setRoom(this.props.idx, { ...this.props.room, imgs: imgs });
    } else {
      let imgs = JSON.parse(JSON.stringify(this.state.room.imgs));
      imgs.splice(idx, 1);
      this.setState({
        room: {
          ...this.state.room,
          imgs: imgs
        }
      })
    }
  }

  submitRoom = (e) => {
    e.preventDefault();
    if (e.target.id !== "room-form" + this.props.idx) {
      return;
    }
    this.props.addNewRoom(this.props.room ? this.props.room : this.state.room);
  }

  render() {
    const room = this.props.room ? this.props.room : this.state.room;
    return (
      <>
        <Card className="shadow w-100">
          <Form id={"room-form" + this.props.idx} onSubmit={this.submitRoom}>
            <Card.Body>
              <Card.Title className="bg-light py-2 mx-4">
                <div className="position-relative">
                  <Form.Control
                    className="room-name custom-form-control h2 bold-500"
                    type="text"
                    onChange={(e) => this.onChange({ ...room, name: e.currentTarget.value })}
                    onBlur={() => this.setState({ focus: null })}
                    placeholder=" "
                    value={room.name}
                    required />
                  <span className="hotel-room h2">Room's name</span>
                </div>
                {/* {
                this.state.focus === "name" || this.state.require === "name" ?
                  <Form.Control
                    type="text"
                    onChange={(e) => this.onChange({ ...room, name: e.currentTarget.value })}
                    onBlur={() => this.setState({ focus: null })}
                    placeholder="Room's name"
                    defaultValue={room.name}
                    autoFocus
                    required />
                  :
                  <div onClick={() => (this.state.edit || !this.props.room) && this.setState({ focus: "name" })}>
                    <h4 className="d-inline">{room.name ? room.name : "Room's name"}</h4>
                    <Button variant="link" className={"text-dark px-0 py-0 align-top" + ((this.state.edit || !this.props.room) ? "" : " d-none")}>
                      &nbsp;<i className="fas fa-edit" />
                    </Button>
                  </div>
              } */}
                {
                  !this.props.room ? "" :
                    <Button variant="dark" className="abs-top-right border-none" onClick={() => this.props.deleteRoom(this.props.idx)}>
                      <h2 className="my-0"><i className="fas fa-times" /></h2>
                    </Button>
                }
              </Card.Title>
              <Row className="align-items-center">
                <Col xs={12} sm={5} md={6} lg={5} className="text-center">
                  <Carousel fade interval={null}>
                    {
                      room.imgs.map((img, idx) => {
                        return (
                          <Carousel.Item>
                            <div className="ratio4-3">
                              <input className="d-none" ref={ref => this.upimgs[idx] = ref} onClick={e => e.currentTarget.value = ""} onChange={(e) => this.uploadImg(e, idx)} type="file" />
                              {img ? <Image className="absolute" src={img} fluid /> : ""}
                              <Button variant="dark" className={"abs-center border-none" + (img ? " bg-fade text-none" : "")} onClick={() => this.upimgs[idx].click()}>
                                <h1 className="my-0"><i className="fas fa-images" /></h1>
                              </Button>
                              <Button variant="dark" className={"abs-top-right border-none" + (img ? " bg-fade" : "")}
                                onClick={() => this.deleteImg(idx)}>
                                <h4 className="my-0"><i className="fas fa-times" /></h4>
                              </Button>
                            </div>
                          </Carousel.Item>
                        )
                      }).concat(
                        <Carousel.Item>
                          <div className="ratio4-3">
                            <Button variant="dark"
                              className="abs-center border-none"
                              onClick={() => this.onChange({ ...room, imgs: room.imgs.concat("") })}>
                              <h1 className="my-0"><i className="fas fa-plus" /></h1>
                            </Button>
                          </div>
                        </Carousel.Item>
                      )
                    }
                  </Carousel>
                </Col>
                <Col xs={12} sm={7} md={6} lg={7}>
                  <Row className="my-3 text-center show-only-mobile">
                    <Col>
                      <Button variant="dark" className="border-dark w-100" onClick={() => this.setState({ collapse: !this.state.collapse })}>
                        {this.state.collapse ? "Show Details" : "Hide Details"}
                      </Button>
                    </Col>
                  </Row>
                  <Collapse in={!this.state.collapse}>
                    <Row className="my-3 text-center">
                      <Col className="px-3 text-right">
                        <Badge variant="dark" className="room-card-property">
                          <div className="my-2">
                            <h6><i className="fas fa-bed"></i></h6>
                            {
                              this.state.focus === "num_bed" ?
                                <Form.Control
                                  type="number"
                                  min={1}
                                  step={1}
                                  onChange={(e) => this.onChange({ ...room, num_bed: Math.max(e.currentTarget.value, 1) })}
                                  onBlur={() => this.setState({ focus: null })}
                                  placeholder="Beds"
                                  defaultValue={room.num_bed}
                                  autoFocus
                                  required />
                                :
                                <div onClick={() => (this.state.edit || !this.props.room) && this.setState({ focus: "num_bed" })}>
                                  <h6 className="d-inline">{room.num_bed} Beds</h6>
                                  <Button variant="link" className={"text-light px-0 py-0 fs-14 align-top" + ((this.state.edit || !this.props.room) ? "" : " d-none")}>
                                    &nbsp;<i className="fas fa-edit" />
                                  </Button>
                                </div>
                            }
                          </div>
                        </Badge>
                      </Col>
                      <Col className="px-3 text-left">
                        <Badge variant="dark" className="room-card-property">
                          <div className="my-2">
                            <h6><i className="fas fa-user-friends"></i></h6>
                            {
                              this.state.focus === "max_person" ?
                                <Form.Control
                                  type="number"
                                  min={1}
                                  step={1}
                                  onChange={(e) => this.onChange({ ...room, max_person: Math.max(e.currentTarget.value, 1) })}
                                  onBlur={() => this.setState({ focus: null })}
                                  placeholder="People"
                                  defaultValue={room.max_person}
                                  autoFocus
                                  required />
                                :
                                <div onClick={() => (this.state.edit || !this.props.room) && this.setState({ focus: "max_person" })}>
                                  <h6 className="d-inline">{room.max_person} People</h6>
                                  <Button variant="link" className={"text-light px-0 py-0 fs-14 align-top" + ((this.state.edit || !this.props.room) ? "" : " d-none")}>
                                    &nbsp;<i className="fas fa-edit" />
                                  </Button>
                                </div>
                            }
                          </div>
                        </Badge>
                      </Col>
                    </Row>
                  </Collapse>
                  <Collapse in={!this.state.collapse}>
                    <Row className="align-items-start" noGutters>
                      <Col xs={3} sm={2} md={3} lg={2}>
                        <Button
                          variant="light"
                          className="room-card-amenity text-center px-0 py-0 my-2 bold text-dark"
                          onClick={() => {
                            if (!this.state.edit && this.props.room) return;
                            let amenities = room.amenities;
                            if (amenities.includes(0)) {
                              amenities.splice(amenities.findIndex(x => x === 0), 1);
                              amenities.push(1);
                            } else {
                              amenities.splice(amenities.findIndex(x => x === 1), 1);
                              amenities.push(0);
                            }
                            amenities.sort((x, y) => x < y ? -1 : 1);
                            this.onChange({ ...room, amenities: amenities });
                          }}>
                          <p dangerouslySetInnerHTML={{ __html: room.amenities.includes(0) ? hotelService.amenities[0].tag : hotelService.amenities[1].tag }} />
                          {room.amenities.includes(0) ? <>{hotelService.amenities[0].name}<br />&nbsp;&nbsp;&nbsp;</> : hotelService.amenities[1].name}
                        </Button>
                      </Col>
                      {
                        hotelService.amenities.slice(2, 13).map((amenity, idx) => {
                          return (
                            <Col xs={3} sm={2} md={3} lg={2} className="text-center">
                              <Button
                                variant="light"
                                className={"room-card-amenity text-center px-0 py-0 my-2 bold" + (room.amenities.includes(idx + 2) ? " text-dark" : " text-lightgray")}
                                onClick={() => {
                                  if (!this.state.edit && this.props.room) return;
                                  let amenities = room.amenities;
                                  if (amenities.includes(idx + 2)) {
                                    amenities.splice(amenities.findIndex(x => x === idx + 2), 1);
                                  } else {
                                    amenities.push(idx + 2);
                                  }
                                  amenities.sort((x, y) => x < y ? -1 : 1);
                                  this.onChange({ ...room, amenities: amenities });
                                }}>
                                <p dangerouslySetInnerHTML={{ __html: amenity.tag }} />
                                {idx + 2 === 7 ? amenity.name : <>{amenity.name}<br />&nbsp;&nbsp;&nbsp;</>}
                              </Button>
                            </Col>
                          )
                        })
                      }
                    </Row>
                  </Collapse>
                </Col>
              </Row>
              <hr />
              <Row className="align-items-center text-center">
                <Col xs={12} md={4} className="my-2">
                  {
                    this.state.focus === "price" ?
                      <Form.Group as={Row} className="my-0 align-items-center">
                        <Form.Label column><h5 className="text-right my-0">Price per room: </h5></Form.Label>
                        <Col className="align-items-center">
                          <Form.Control
                            type="number"
                            min={0}
                            step={1}
                            onChange={(e) => this.onChange({ ...room, price: Math.max(e.currentTarget.value, 0) })}
                            onBlur={() => this.setState({ focus: null })}
                            placeholder="Price"
                            defaultValue={room.price === 0 ? "" : room.price}
                            autoFocus
                            required />
                        </Col>
                      </Form.Group>
                      :
                      <div onClick={() => (this.state.edit || !this.props.room) && this.setState({ focus: "price" })}>
                        <h5 className="d-inline">Price per room: <strong>฿ {room.price}</strong></h5>
                        <Button variant="link" className={"text-dark px-0 py-0 fs-14 align-top" + ((this.state.edit || !this.props.room) ? "" : " d-none")}>
                          &nbsp;<i className="fas fa-edit" />
                        </Button>
                      </div>
                  }
                </Col>
                <Col xs={12} md={5} className="my-2">
                  {
                    this.state.focus === "total_room" ?
                      <Form.Group as={Row} className="my-0 align-items-center">
                        <Form.Label column><h5 className="text-right my-0">Total room: </h5></Form.Label>
                        <Col className="align-items-center">
                          <Form.Control
                            type="number"
                            min={1}
                            step={1}
                            onChange={(e) => this.onChange({ ...room, total_room: Math.max(e.currentTarget.value, 1), available_room: Math.max(e.currentTarget.value, 1) })}
                            onBlur={() => this.setState({ focus: null })}
                            placeholder="Total room"
                            defaultValue={room.total_room}
                            autoFocus
                            required />
                        </Col>
                      </Form.Group>
                      :
                      <div onClick={() => (this.state.edit || !this.props.room) && this.setState({ focus: "total_room" })}>
                        <h5 className="d-inline">Total room: <strong>{room.total_room} room{room.total_room > 1 ? "s" : ""}</strong></h5>
                        <Button variant="link" className={"text-dark px-0 py-0 fs-14 align-top" + ((this.state.edit || !this.props.room) ? "" : " d-none")}>
                          &nbsp;<i className="fas fa-edit" />
                        </Button>
                      </div>
                  }
                </Col>
                <Col xs={12} md={3} className="my-2">
                  {
                    this.props.room ?
                      <Button variant="success" disabled className="py-3 px-4">
                        <span className="h4">Auto saved</span>
                      </Button>
                      // this.state.edit ?
                      //   <Button variant="success" className="py-3 px-4" onClick={() => this.setState({ edit: false })}>
                      //     <span className="h4">Save change</span>
                      //   </Button>
                      //   :
                      //   <Button variant="success" className="py-3 px-4" onClick={() => this.setState({ edit: true })}>
                      //     <span className="h4">Edit</span>
                      //   </Button>
                      :
                      <Button type="submit" form={"room-form" + this.props.idx} variant="success" className="py-3 px-4">
                        <span className="h4">Create this room</span>
                      </Button>
                  }
                </Col>
              </Row>
            </Card.Body>
          </Form>
        </Card>
        <CustomModal
          showModal={this.state.showModal === "upload_not_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="This file is not an image. " />
        <CustomModal
          showModal={this.state.showModal === "upload_large_img"}
          closeModal={() => this.setState({ showModal: null })}
          title="Unable to upload the file"
          body="The file size exceeds the limit of 5 MB." />
      </>
    )
  }
}
