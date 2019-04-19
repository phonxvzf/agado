import React, { Component } from 'react'
import { Card, Row, Col, Image, InputGroup, Form, Button, Badge, Collapse, Carousel, Alert } from 'react-bootstrap';
import { hotelService } from '../service/hotelService';

export default class NewRoomCard extends Component {
  componentWillMount() {
    this.upimgs = [];
    this.setState({
      focus: null,
      room: {
        name: "",
        imgs: [],
        beds: 1,
        maxPerson: 1,
        price: 0,
        availableRoom: 1,
        totalRoom: 1,
        amenities: []
      }
    });
  }

  componentWillReceiveProps() {
    if (this.state.room) {
      this.setState({
        room: {
          name: "",
          imgs: [],
          beds: 1,
          maxPerson: 1,
          price: 0,
          availableRoom: 1,
          totalRoom: 1,
          amenities: []
        }
      })
    }
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

  render() {
    const room = this.props.room ? this.props.room : this.state.room;
    return (
      <Card className="shadow w-100">
        <Card.Body>
          <Card.Title className="bg-white py-2 mx-4">
            {
              this.state.focus === "name" ?
                <Form.Control
                  type="text"
                  onChange={(e) => this.onChange({ ...room, name: e.currentTarget.value })}
                  onBlur={() => this.setState({ focus: null })}
                  placeholder="Room's name"
                  defaultValue={room.name}
                  autoFocus
                  required />
                :
                <>
                  <h4 className="d-inline">{room.name ? room.name : "Room's name"}</h4>
                  <span>
                    <strike className="px-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strike>
                    <Button variant="link" className="text-dark px-0" onClick={() => this.setState({ focus: "name" })}>
                      edit&nbsp;<i className="fas fa-edit" />
                    </Button>
                  </span>
                  <br />
                </>
            }
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
                          <input className="d-none" ref={ref => this.upimgs[idx] = ref} onChange={(e) => this.uploadImg(e, idx)} type="file" />
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
                          this.state.focus === "beds" ?
                            <Form.Control
                              type="number"
                              min={1}
                              onChange={(e) => this.onChange({ ...room, beds: Math.max(e.currentTarget.value, 1) })}
                              onBlur={() => this.setState({ focus: null })}
                              placeholder="Beds"
                              defaultValue={room.beds}
                              autoFocus
                              required />
                            :
                            <>
                              <h6>{room.beds} Beds</h6>
                              <Button variant="link" className="text-light px-0 py-0 fs-14" onClick={() => this.setState({ focus: "beds" })}>
                                edit&nbsp;<i className="fas fa-edit" />
                              </Button>
                            </>
                        }
                      </div>
                    </Badge>
                  </Col>
                  <Col className="px-3 text-left">
                    <Badge variant="dark" className="room-card-property">
                      <div className="my-2">
                        <h6><i className="fas fa-user-friends"></i></h6>
                        {
                          this.state.focus === "maxPerson" ?
                            <Form.Control
                              type="number"
                              min={1}
                              onChange={(e) => this.onChange({ ...room, maxPerson: Math.max(e.currentTarget.value, 1) })}
                              onBlur={() => this.setState({ focus: null })}
                              placeholder="People"
                              defaultValue={room.maxPerson}
                              autoFocus
                              required />
                            :
                            <>
                              <h6>{room.maxPerson} People</h6>
                              <Button variant="link" className="text-light px-0 py-0 fs-14" onClick={() => this.setState({ focus: "maxPerson" })}>
                                edit&nbsp;<i className="fas fa-edit" />
                              </Button>
                            </>
                        }
                      </div>
                    </Badge>
                  </Col>
                </Row>
              </Collapse>
              <Collapse in={!this.state.collapse}>
                <Row noGutters>
                  <Col xs={3} sm={2} md={3} lg={2}
                    className="room-card-amenity text-center my-2 bold"
                    onClick={() => {
                      let amenities = room.amenities;
                      amenities[0] = !amenities[0];
                      this.onChange({ ...room, amenities: amenities });
                    }}>
                    <p dangerouslySetInnerHTML={{ __html: room.amenities[0] ? hotelService.amenities[0].tag : hotelService.amenities[1].tag }} />
                    {room.amenities[0] ? hotelService.amenities[0].name : hotelService.amenities[1].name}
                  </Col>
                  {
                    hotelService.amenities.slice(2, 13).map((amenity, idx) => {
                      return (
                        <Col xs={3} sm={2} md={3} lg={2}
                          className={"room-card-amenity text-center my-2 " + (room.amenities[idx + 1] ? "text-dark bold" : "text-lightgray")}
                          onClick={() => {
                            let amenities = room.amenities;
                            amenities[idx + 1] = !amenities[idx + 1];
                            this.onChange({ ...room, amenities: amenities });
                          }}>
                          <p dangerouslySetInnerHTML={{ __html: amenity.tag }} />
                          {amenity.name}
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
                  <Form.Group as={Row}>
                    <Form.Label column><h5 className="text-right">Price per room: </h5></Form.Label>
                    <Col>
                      <Form.Control
                        type="number"
                        min={0}
                        onChange={(e) => this.onChange({ ...room, price: Math.max(e.currentTarget.value, 0) })}
                        onBlur={() => this.setState({ focus: null })}
                        placeholder="Price"
                        defaultValue={room.price}
                        autoFocus
                        required />
                    </Col>
                  </Form.Group>
                  :
                  <>
                    <h5>Price per room: <strong>฿ {room.price}</strong></h5>
                    <Button variant="link" className="text-dark px-0 py-0 fs-14" onClick={() => this.setState({ focus: "price" })}>
                      edit&nbsp;<i className="fas fa-edit" />
                    </Button>
                  </>
              }
            </Col>
            <Col xs={12} md={5} className="my-2">
              {
                this.state.focus === "totalRoom" ?
                  <Form.Group as={Row}>
                    <Form.Label column><h5 className="text-right">Total room: </h5></Form.Label>
                    <Col>
                      <Form.Control
                        type="number"
                        min={1}
                        onChange={(e) => this.onChange({ ...room, totalRoom: Math.max(e.currentTarget.value, 1), availableRoom: Math.max(e.currentTarget.value, 1) })}
                        onBlur={() => this.setState({ focus: null })}
                        placeholder="Total room"
                        defaultValue={room.totalRoom}
                        autoFocus
                        required />
                    </Col>
                  </Form.Group>
                  :
                  <>
                    <h5>Total room: <strong>{room.totalRoom} room{room.totalRoom > 1 ? "s" : ""}</strong></h5>
                    <Button variant="link" className="text-dark px-0 py-0 fs-14" onClick={() => this.setState({ focus: "totalRoom" })}>
                      edit&nbsp;<i className="fas fa-edit" />
                    </Button>
                  </>
              }
            </Col>
            <Col xs={12} md={3} className="my-2">
              {
                this.props.room ? "" :
                  <Button variant="success" className="py-3 px-4" onClick={() => this.props.addNewRoom(room)}>
                    <span className="h6">Create this room</span>
                  </Button>
              }
            </Col>
          </Row>
        </Card.Body>
      </Card>
    )
  }
}
