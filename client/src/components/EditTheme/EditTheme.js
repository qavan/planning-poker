import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

export class EditTheme extends React.Component {
  state = {
    theme: this.props.currentTheme
  };

  onSet = event => {
    event.preventDefault();
    this.props.onSet(this.state.theme);
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <hr />
            <Form>
              <Form.Group>
                <Form.Label>Тема голосования</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите тему"
                  value={this.state.theme}
                  onChange={event =>
                    this.setState({ theme: event.target.value })
                  }
                />
              </Form.Group>
              <Button variant="secondary" onClick={this.onSet}>
                Установить
              </Button>
            </Form>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
