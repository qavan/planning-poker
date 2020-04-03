import React from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { setMessage } from "../../functions";

class ModalPassword extends React.Component {
  state = {
    password: "",
    message: null
  };

  checkPasswordHandler = async () => {
    const { password } = this.state;
    const response = await fetch("/api/teams/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.props.token}`
      },
      body: JSON.stringify({
        teamId: this.props.teamId,
        teamPass: password
      })
    });
    const data = await response.json();
    if (response.status === 200) {
      this.props.history.push(`/team/${this.props.teamId}`);
    } else {
      setMessage.call(this, "danger", data.message);
    }
  };

  closeHandler = () => {
    this.setState({
      password: "",
      message: null
    });
    this.props.closeModal();
  };

  render() {
    return (
      <Modal show={this.props.showModal} onHide={this.closeHandler}>
        <Modal.Header closeButton>
          <Modal.Title>Введите пароль команды</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.message ? (
            <Alert variant={this.state.message.type}>
              {this.state.message.text}
            </Alert>
          ) : null}
          <Form>
            <Form.Group>
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={this.state.password}
                onChange={event => {
                  this.setState({ password: event.target.value });
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closeHandler}>
            Отмена
          </Button>
          <Button variant="secondary" onClick={this.checkPasswordHandler}>
            Войти
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withRouter(ModalPassword);
