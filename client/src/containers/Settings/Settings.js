import React from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import UserSettings from "../../components/UserSettings/UserSettings";
import { UserTeamsList } from "../../components/UserTeamsList/UserTeamsList";
import { setLoading, setMessage } from "../../functions";

export default class Settings extends React.Component {
  state = {
    loading: true,
    userName: "",
    message: null,
    userTeams: null
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
      this.setState({
        loading: false,
        userName: data.result.userName,
        userTeams: data.result.teams
      });
    } catch (error) {
      setMessage.call(this, "danger", "Произошла ошибка!");
    }
  }

  async componentDidMount() {
    await this.loadUserSettings();
  }

  async updateUserNameHandler(userName) {
    setLoading.call(this, true);

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
        setMessage.call(this, "success", data.message);
        await this.loadUserSettings();
      } else {
        setMessage.call(this, "danger", "Произошла ошибка!");
      }
    } catch (error) {
      setMessage.call(this, "danger", "Произошла ошибка!");
    }

    setLoading.call(this, false);
  }

  async deleteTeam(teamId) {
    setLoading.call(this, true);

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
        setMessage.call(this, "success", data.message);
      } else {
        setMessage.call(this, "danger", data.message);
      }
    } catch (error) {}
    await this.loadUserSettings();

    setLoading.call(this, false);
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
            <h4 className="text-center title">Настройки пользователя</h4>
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
