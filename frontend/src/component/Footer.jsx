import React, { Component } from 'react'
import { Row, Navbar, Button, Nav } from 'react-bootstrap';

export default class Footer extends Component {
  render() {
    return (
      <Row className="px-0 scroll-snap-child" noGutters>
        <Navbar bg="light" className="w-100">
          <Navbar.Text className="ml-xs-2 ml-sm-5">© 2019 Agado</Navbar.Text>
          <Navbar.Collapse className="justify-content-end mr-md-5 mr-xs-0">
            <Nav>
              <Button variant="link" className="text-dark">Privacy policy</Button>
              <Button variant="link" className="text-dark">Term of Use</Button>
              <Button variant="link" className="text-dark">Cookies policy</Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Row>
    )
  }
}
