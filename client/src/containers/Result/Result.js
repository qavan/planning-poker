import React from "react";
import { Container, Row, Col, Alert, Table } from "react-bootstrap";
import { Loader } from "../../components/Loader/Loader";
import { setLoading, setMessage } from "../../functions";

export class Result extends React.Component {
  state = {
    loading: true,
    message: null,
    teamName: "",
    theme: "",
    average: null,
    date: null,
    userResults: []
  };

  async componentDidMount() {
    try {
      setLoading.call(this, true);
      const response = await fetch(
        `/api/results/${this.props.match.params.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.props.token}`
          }
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        console.log(data.data);
        this.setState({
          loading: false,
          teamName: data.data.teamName,
          theme: data.data.theme,
          average: data.data.average,
          date: data.data.date,
          userResults: data.data.results.users
        });
      } else {
        setMessage.call(this, "danger", data.message);
      }
    } catch (error) {
      setLoading.call(this, false);
      setMessage.call(this, "danger", "Произошла ошибка при загрузке");
    }
  }

  dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  };

  renderUsers = results => {
    return results.map(result => {
      return (
        <tr key={result._id}>
          <td>{result.userName}</td>
          <td>{result.value}</td>
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
      <React.Fragment>
        <h4 className="text-center title">Результат</h4>
        <Container>
          <Row>
            <Col>
              {this.state.message ? (
                <Alert variant={this.state.message.type}>
                  {this.state.message.text}
                </Alert>
              ) : (
                <React.Fragment>
                  <p>
                    <b>Название команды: </b>
                    {this.state.teamName}
                  </p>
                  <p>
                    <b>Тема голосования: </b>
                    {this.state.theme}
                  </p>
                  <p>
                    <b>Среднее: </b>
                    {this.state.average}
                  </p>
                  <p>
                    <b>Дата: </b>
                    {new Date(this.state.date).toLocaleString(
                      "ru",
                      this.dateOptions
                    )}
                  </p>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Пользователь</th>
                        <th>Значение</th>
                      </tr>
                    </thead>
                    <tbody>{this.renderUsers(this.state.userResults)}</tbody>
                  </Table>
                </React.Fragment>
              )}
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}
