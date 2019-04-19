import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default class CustomModal extends Component {
  render() {
    return (
      <Modal
        className={this.props.className}
        dialogClassName={this.props.dialogClassName}
        show={this.props.showModal}
        onHide={this.props.closeModal}
        restoreFocus={false}
        centered>
        {
          this.props.all ? this.props.all : (
            <>
              <Modal.Header closeButton={!this.props.noCloseButton}>
                <Modal.Title>{this.props.title}</Modal.Title>
                {this.props.header}
              </Modal.Header>
              <Modal.Body>{this.props.body}</Modal.Body>
              {
                this.props.noFooter ? "" :
                  <Modal.Footer>
                    {this.props.footer}
                    {this.props.noCloseButton ? "" : <Button variant="secondary" onClick={this.props.closeModal}>Close</Button>}
                  </Modal.Footer>
              }
            </>
          )
        }
      </Modal>
    )
  }
}
