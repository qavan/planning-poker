import React from "react";
import { Container, Row, Col, Table, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { setLoading, setMessage } from "../../functions";

export class ResultsList extends React.Component {
  state = {
    loading: true,
    results: null,
    message: null
  };

  async componentDidMount() {
    try {
      setLoading.call(this, true);

      const response = await fetch("/api/results", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        }
      });
      const data = await response.json();
      if (response.status === 200) {
        this.setState({
          loading: false,
          results: data.data
        });
      } else {
        setMessage.call(this, "danger", data.message);
      }
    } catch (error) {
      setMessage.call(this, "danger", "Произошла ошибка при создании команды!");
    }
  }

  renderResults = results => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };

    return results.map(result => {
      return (
        <tr key={result.resultId}>
          <td>{result.teamName}</td>
          <td>{new Date(result.date).toLocaleString("ru", options)}</td>
          <td>{result.theme}</td>
          <td>{result.average}</td>
          <td>
            <NavLink to={"/result/" + result.resultId}>Перейти</NavLink>
          </td>
        </tr>
      );
    });
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
            <h4 className="text-center title">Список результатов</h4>
            {this.state.message ? (
              <Alert variant={this.state.message.type}>
                {this.state.message.text}
              </Alert>
            ) : null}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Название команды</th>
                  <th>Дата</th>
                  <th>Тема</th>
                  <th>Среднее</th>
                  <th>Просмотр</th>
                </tr>
              </thead>
              <tbody>{this.renderResults(this.state.results)}</tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  }
}
