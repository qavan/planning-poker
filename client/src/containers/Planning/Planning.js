import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import { EditTheme } from "../../components/EditTheme/EditTheme";
import { PlanningWaiting } from "../../components/PlanningWaiting/PlanningWaiting";
import { PlanningVoting } from "../../components/PlanningVoting/PlanningVoting";

export default class Planning extends React.Component {
  state = {
    loading: true,
    status: "waiting",
    lastState: null,
    currentState: null,
    marks: [1, 3, 5, 7, 9, 11, 13],
    connection: null,
    showAdminButtons: false,
    theme: ""
  };

  componentDidMount() {
    try {
      let ws = new WebSocket("ws://192.168.1.14:3001");
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            method: "CONNECT_TO_TEAM",
            teamId: this.props.match.params.id,
            token: this.props.token
          })
        );
      };
      ws.onmessage = data => {
        const decoded = JSON.parse(data.data);
        console.log(decoded);
        if (decoded.status && decoded.status === "waiting") {
          let adminButtonsVisible = false;
          decoded.users.map(user => {
            if (user.userId === this.props.userId && user.owner === true) {
              adminButtonsVisible = true;
            }
            return null;
          });
          this.setState({
            loading: false,
            status: "waiting",
            lastState: {
              users: decoded.users
            },
            theme: decoded.theme,
            showAdminButtons: adminButtonsVisible
          });
        } else {
          let adminButtonsVisible = false;
          let userVoted = false;
          decoded.users.map(user => {
            if (user.userId === this.props.userId && user.owner === true) {
              adminButtonsVisible = true;
            }
            if (
              user.userId === this.props.userId &&
              user.status !== "waiting"
            ) {
              userVoted = true;
            }
            return null;
          });
          this.setState({
            loading: false,
            status: "voting",
            currentState: {
              users: decoded.users
            },
            theme: decoded.theme,
            userVoted,
            showAdminButtons: adminButtonsVisible
          });
        }
      };
      ws.onclose = data => {
        console.log(data);
        this.props.history.push("/teams");
      };
      this.setState({
        connection: ws
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentWillUnmount() {
    if (this.state.connection) {
      this.state.connection.close();
    }
  }

  startVoting = () => {
    if (this.state.connection) {
      this.state.connection.send(
        JSON.stringify({
          method: "START_VOTING",
          token: this.props.token,
          teamId: this.props.match.params.id
        })
      );
    }
  };

  stopVoting = () => {
    if (this.state.connection) {
      this.state.connection.send(
        JSON.stringify({
          method: "STOP_VOTING",
          token: this.props.token,
          teamId: this.props.match.params.id
        })
      );
    }
  };

  setVote = voteValue => {
    if (this.state.connection) {
      this.state.connection.send(
        JSON.stringify({
          method: "SET_VOTE_VALUE",
          token: this.props.token,
          teamId: this.props.match.params.id,
          voteValue
        })
      );
    }
  };

  setVotingTheme = voteTheme => {
    if (this.state.connection) {
      this.state.connection.send(
        JSON.stringify({
          method: "SET_THEME",
          token: this.props.token,
          theme: voteTheme,
          teamId: this.props.match.params.id
        })
      );
    }
  };

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
            {this.state.status === "waiting" ? (
              <PlanningWaiting
                theme={this.state.theme}
                lastState={this.state.lastState}
                showAdminButtons={this.state.showAdminButtons}
                startVoting={this.startVoting}
              />
            ) : (
              <PlanningVoting
                theme={this.state.theme}
                userVoted={this.state.userVoted}
                marks={this.state.marks}
                setVote={this.setVote}
                currentState={this.state.currentState}
                stopVoting={this.stopVoting}
                showAdminButtons={this.state.showAdminButtons}
              />
            )}
          </Col>
        </Row>
        {this.state.loading ? null : (
          <React.Fragment>
            {this.state.showAdminButtons ? (
              <EditTheme
                onSet={this.setVotingTheme}
                currentTheme={this.state.theme}
              />
            ) : null}
          </React.Fragment>
        )}
      </Container>
    );
  }
}
