import React from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import classes from "./TeamsList.module.sass";

export default class TeamList extends React.Component {
  state = {
    teamName: "",
    teamPass: "",
    message: null,
    loading: true,
    teams: null
  };

  async createTeamHandler(event) {
    event.preventDefault();
    try {
      const { teamName, teamPass } = this.state;
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        },
        body: JSON.stringify({
          teamName,
          teamPass
        })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.setState({
          message: {
            type: "success",
            text: "Команда создана!"
          },
          teamName: "",
          teamPass: ""
        });
        this.loadTeams();
      } else {
        this.setState({
          message: {
            type: "danger",
            text: data.message
          }
        });
      }
    } catch (error) {
      this.setState({
        message: {
          type: "danger",
          text: "Произошла ошибка при создании команды!"
        }
      });
    }
  }

  async loadTeams() {
    this.setState({ loading: true });

    const response = await fetch("/api/teams/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.props.token}`
      }
    });
    const data = await response.json();
    this.setState({
      teams: data.teams
    });
  }

  async componentDidMount() {
    this.loadTeams();
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h4 className={`text-center ${classes.title}`}>Создать команду</h4>
            {this.state.message ? (
              <Alert variant={this.state.message.type}>
                {this.state.message.text}
              </Alert>
            ) : null}
            <Form>
              <Form.Group>
                <Form.Label>Название</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите название"
                  value={this.state.teamName}
                  onChange={event =>
                    this.setState({ teamName: event.target.value })
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Введите пароль"
                  value={this.state.teamPass}
                  onChange={event =>
                    this.setState({ teamPass: event.target.value })
                  }
                />
                <Form.Text className="text-muted">
                  Необязательное поле
                </Form.Text>
              </Form.Group>
              <Button
                variant="secondary"
                onClick={event => this.createTeamHandler(event)}
              >
                Создать
              </Button>
            </Form>
            <hr />
            <h4 className={`text-center ${classes.title}`}>Список команд</h4>
            {this.state.loading ? <Loader /> : this.renderTeams()}
          </Col>
        </Row>
      </Container>
    );
  }

  //TODO: render teams as table
}
