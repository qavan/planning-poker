import React from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import classes from "./Auth.module.sass";
import { setMessage } from "../../functions";

export default class Auth extends React.Component {
  state = {
    login: "",
    password: "",
    message: null,
    blocked: false
  };

  async registerHandler(event) {
    event.preventDefault();
    const { login, password } = this.state;
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName: login,
          password
        })
      });
      const data = await response.json();
      if (response.status === 201) {
        setMessage.call(this, "success", "Пользователь зарегистрирован!");
      } else {
        setMessage.call(
          this,
          "danger",
          data.message || "Произошла ошибка при регистрации!"
        );
      }
    } catch (error) {
      setMessage.call(this, "danger", "Произошла ошибка при регистрации!");
    }
  }

  async loginHandler(event) {
    event.preventDefault();
    const { login, password } = this.state;
    try {
      this.setState({
        blocked: true
      });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName: login,
          password
        })
      });
      const data = await response.json();
      if (data.token) {
        this.props.onLogin(data.token, data.userId);
      } else {
        setMessage.call(
          this,
          "danger",
          data.message || "Произошла ошибка при авторизации!"
        );
      }
    } catch (error) {
      setMessage.call(this, "danger", "Произошла ошибка при авторизации!");
    }
    this.setState({
      blocked: false
    });
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h2 className={`text-center ${classes.h2}`}>Авторизация</h2>
            {this.state.message ? (
              <Alert variant={this.state.message.type}>
                {this.state.message.text}
              </Alert>
            ) : null}

            <Form>
              <Form.Group>
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={this.state.login}
                  onChange={event => {
                    this.setState({ login: event.target.value });
                  }}
                />
              </Form.Group>

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

              <Button
                variant="primary"
                className={classes.Button}
                onClick={event => this.loginHandler(event)}
                disabled={this.state.blocked}
              >
                Войти
              </Button>
              <Button
                variant="secondary"
                onClick={event => {
                  this.registerHandler(event);
                }}
                disabled={this.state.blocked}
              >
                Зарегистрироваться
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}
