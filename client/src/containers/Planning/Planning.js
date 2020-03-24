import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import classes from "./Planning.module.sass";
import { Results } from "../../components/Results/Results";
import { MarksList } from "../../components/MarksList/MarksList";

export default class Planning extends React.Component {
  state = {
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
    marks: [1, 3, 5, 7, 9, 11, 13]
  };

  render() {
    return (
      <Container>
        <Row>
          <Col>
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
                <h4 className={`text-center ${classes.title}`}>Планирование</h4>
                <MarksList marks={this.state.marks} />
              </React.Fragment>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

//TODO: actual state
