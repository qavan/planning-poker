import React from "react";
import { Form, Button } from "react-bootstrap";

export default class UserSettings extends React.Component {
  state = {
    name: this.props.userName
  };

  sendQuery = event => {
    event.preventDefault();
    this.props.onSend(this.state.name);
  };

  render() {
    return (
      <Form>
        <Form.Group>
          <Form.Label>Имя пользователя</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите имя пользователя"
            value={this.state.name}
            onChange={event => this.setState({ name: event.target.value })}
          />
        </Form.Group>
        <Button variant="secondary" onClick={this.sendQuery}>
          Обновить
        </Button>
      </Form>
    );
  }
}
