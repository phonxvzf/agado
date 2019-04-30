import React, { Component } from 'react';
import '../css/Loading.css';

export default class Loading extends Component {
  render() {
    return (
      <div className="error-bg scroll-snap-child">
        <div className="loading">
          <div class="spinner-grow text-danger" role="status" />
          <div class="spinner-grow text-warning" role="status" />
          <div class="spinner-grow text-success" role="status" />
          <div class="spinner-grow text-purple" role="status" />
          <div class="spinner-grow text-primary" role="status" />
        </div>
      </div>
    )
  }
}
