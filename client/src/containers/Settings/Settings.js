import React from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import classes from "./Settings.module.sass";

export default class Settings extends React.Component {
  state = {
    loading: true,
    userName: "",
    message: null
  };

  async loadUserSettings() {
    try {
      const response = await fetch("/api/user/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        }
      });
      const data = await response.json();
      console.log(data);
      this.setState({
        loading: false,
        userName: data.result.userName
      });
    } catch (error) {
      this.setState({
        message: {
          type: "danger",
          text: "Произошла ошибка!"
        }
      });
    }
  }

  async componentDidMount() {
    await this.loadUserSettings();
  }

  async updateUserNameHandler() {
    const { userName } = this.state;
    this.setState({
      loading: true
    });

    try {
      const response = await fetch("/api/user/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        },
        body: JSON.stringify({
          userName
        })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.setState({
          message: {
            type: "success",
            text: data.message
          }
        });
        this.loadUserSettings();
      } else {
        this.setState({
          message: {
            type: "danger",
            text: "Произошла ошибка!"
          }
        });
      }
    } catch (error) {
      this.setState({
        message: {
          type: "danger",
          text: "Произошла ошибка!"
        }
      });
    }
    this.setState({
      loading: false
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <Container>
          <Row>
            <Col>
              <Loader />
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container>
        <Row>
          <Col>
            <h4 className={`text-center ${classes.title}`}>
              Настройки пользователя
            </h4>
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
                  value={this.state.userName}
                  onChange={event =>
                    this.setState({ userName: event.target.value })
                  }
                />
              </Form.Group>
              <Button
                variant="secondary"
                onClick={this.updateUserNameHandler.bind(this)}
              >
                Обновить
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }

  //TODO: delete room, when this room has no users
}
