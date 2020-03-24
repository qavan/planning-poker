import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table
} from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import classes from "./TeamsList.module.sass";
import { NavLink } from "react-router-dom";

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
    if (!this.state.teamName) {
      this.setState({
        message: {
          type: "danger",
          text: "Имя команды не может быть пустым!"
        }
      });
      return;
    }
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
    try {
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
        teams: data.teams,
        loading: false
      });
      console.log(this.state);
    } catch (error) {
      this.setState({
        message: {
          type: "danger",
          text: "Произошла ошибка при загрузке команд!"
        }
      });
    }
    this.setState({
      loading: false
    });
  }

  async componentDidMount() {
    this.loadTeams();
  }

  renderTeams() {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип доступа</th>
            <th>Статус</th>
            <th>Подключение</th>
          </tr>
        </thead>
        <tbody>
          {this.state.teams
            ? this.state.teams.teamOwner.map((team, index) => {
                return (
                  <tr key={`owner_${index}`} team={team.teamId}>
                    <td>{team.teamName}</td>
                    <td>
                      {team.accessType === "open" ? "Открытый" : "По паролю"}
                    </td>
                    <td>
                      {team.teamStatus === "waiting"
                        ? "Ожидание"
                        : "Голосование"}
                    </td>
                    <td>
                      <NavLink to={"/team/" + team.teamId}>
                        Присоединиться
                      </NavLink>
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </Table>
    );
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
                disabled={this.state.loading}
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
}
