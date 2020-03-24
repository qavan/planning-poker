import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import classes from "./Planning.module.sass";
import { Results } from "../../components/Results/Results";
import { MarksList } from "../../components/MarksList/MarksList";
import { Loader } from "../../components/Loader/Loader";

export default class Planning extends React.Component {
  state = {
    loading: true,
    status: "voting",
    lastState: {
      users: [
        {
          name: "test",
          status: 3,
          owner: true
        },
        {
          name: "test1",
          status: 10
        }
      ]
    },
    marks: [1, 3, 5, 7, 9, 11, 13],
    connection: null
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
        console.log(data.data);
        console.log(JSON.parse(data.data));
      };
      ws.onclose = data => {
        console.log(data);
      };
    } catch (error) {
      console.log(error);
    }
  }

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
                          Результат последнего голосования
                        </h4>
                        <Results results={this.state.lastState} />
                      </React.Fragment>
                    ) : (
                      <h4 className={`text-center ${classes.title}`}>
                        Ожидание начала голосования
                      </h4>
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <h4 className={`text-center ${classes.title}`}>
                      Планирование
                    </h4>
                    <MarksList marks={this.state.marks} />
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

//TODO: get userID on auth
