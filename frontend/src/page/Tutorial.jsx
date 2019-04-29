import qs from 'qs';
import React, { Component } from 'react';
import { Alert, Jumbotron } from 'react-bootstrap';
import '../css/Tutorial.css';

export default class Tutorial extends Component {
  componentWillMount() {
    const pathname = window.location.pathname;
    const search = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    this.setState({
      pathname: pathname,
      search: search
    });
  }

  render() {
    return (
      <div className="profile-bg scroll-snap-child">
        <Jumbotron className="h-80 shadow bg-light">
          <h1>Tutorial</h1>
          <a href="https://tinyurl.com/y3scfqaj"><Alert variant="light" className="border-dark text-dark my-5">Download User Manual</Alert></a>
        </Jumbotron>;
      </div>
    )
  }
}
