import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import classes from "./Planning.module.sass";
import { Results } from "../../components/Results/Results";
import { MarksList } from "../../components/MarksList/MarksList";
import { Loader } from "../../components/Loader/Loader";
import { AdminButtonsStart } from "../../components/AdminButtonsStart/AdminButtonsStart";
import { AdminButtonsStop } from "../../components/AdminButtonsStop/AdminButtonsStop";

export default class Planning extends React.Component {
  state = {
    loading: true,
    status: "waiting",
    lastState: null,
    currentState: null,
    marks: [1, 3, 5, 7, 9, 11, 13],
    connection: null,
    showAdminButtons: false
  };

  componentDidMount() {
    try {
      let ws = new WebSocket("ws://localhost:3001");
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
            if (user.userId == this.props.userId && user.owner === true) {
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
            showAdminButtons: adminButtonsVisible
          });
        } else {
          let adminButtonsVisible = false;
          let userVoted = false;
          decoded.users.map(user => {
            if (user.userId == this.props.userId && user.owner === true) {
              adminButtonsVisible = true;
            }
            if (user.userId == this.props.userId && user.status !== "waiting") {
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
            userVoted,
            showAdminButtons: adminButtonsVisible
          });
        }
      };
      ws.onclose = () => {
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

  render() {
    return (
      <Container>
        <Row>
          <Col>
            {this.state.loading ? (
              <Loader />
            ) : (
              <React.Fragment>
                {this.state.status === "waiting" ? (
                  <React.Fragment>
                    {this.state.lastState ? (
                      <React.Fragment>
                        <h4 className={`text-center ${classes.title}`}>
                          Ожидание начала голосования
                        </h4>
                        <h6 className={`text-center ${classes.title}`}>
                          Результат последнего голосования
                        </h6>
                        <Results results={this.state.lastState} />
                        {this.state.showAdminButtons ? (
                          <AdminButtonsStart onStart={this.startVoting} />
                        ) : null}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <h4 className={`text-center ${classes.title}`}>
                          Ожидание начала голосования
                        </h4>
                        {this.state.showAdminButtons ? (
                          <AdminButtonsStart onStart={this.startVoting} />
                        ) : null}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <h4 className={`text-center ${classes.title}`}>
                      Планирование
                    </h4>
                    {!this.state.userVoted ? (
                      <MarksList
                        marks={this.state.marks}
                        onVote={this.setVote}
                      />
                    ) : null}
                    <Results results={this.state.currentState} />
                    {this.state.showAdminButtons ? (
                      <AdminButtonsStop onStop={this.stopVoting} />
                    ) : null}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

//TODO: set table responsive
//TODO: beautify code
