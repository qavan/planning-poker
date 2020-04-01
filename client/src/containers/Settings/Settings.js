import React from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import classes from "./Settings.module.sass";
import UserSettings from "../../components/UserSettings/UserSettings";
import { UserTeamsList } from "../../components/UserTeamsList/UserTeamsList";

export default class Settings extends React.Component {
  state = {
    loading: true,
    userName: "",
    message: null,
    userTeams: null
  };

  setMessage = (type, message) => {
    this.setState({
      message: {
        type,
        text: message
      }
    });
  };

  setLoading = value => {
    this.setState({
      loading: value
    });
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
        userName: data.result.userName,
        userTeams: data.result.teams
      });
    } catch (error) {
      this.setMessage("danger", "Произошла ошибка!");
    }
  }

  async componentDidMount() {
    await this.loadUserSettings();
  }

  async updateUserNameHandler(userName) {
    this.setLoading(true);

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
        this.setMessage("success", data.message);
        await this.loadUserSettings();
      } else {
        this.setMessage("danger", "Произошла ошибка!");
      }
    } catch (error) {
      this.setMessage("danger", "Произошла ошибка!");
    }

    this.setLoading(false);
  }

  async deleteTeam(teamId) {
    this.setLoading(true);

    try {
      const response = await fetch("/api/teams/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        },
        body: JSON.stringify({
          teamId
        })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.setMessage("success", data.message);
      } else {
        this.setMessage("danger", data.message);
      }
    } catch (error) {}
    await this.loadUserSettings();

    this.setLoading(false);
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
          </Col>
        </Row>
        <Row>
          <Col>
            <UserSettings
              onSend={this.updateUserNameHandler.bind(this)}
              userName={this.state.userName}
            />
            <hr />
          </Col>
        </Row>
        <UserTeamsList
          teamsList={this.state.userTeams}
          onDelete={this.deleteTeam.bind(this)}
        />
      </Container>
    );
  } 
}
