import React from "react";
import Auth from "./containers/Auth/Auth";
import Header from "./components/Header/Header";
import TeamsList from "./containers/TeamsList/TeamsList";
import Settings from "./containers/Settings/Settings";
import Planning from "./containers/Planning/Planning";
import { Switch, Route, Redirect } from "react-router-dom";
import { ResultsList } from "./containers/ResultsList/ResultsList";
import { Result } from "./containers/Result/Result";
import "./App.sass";

export default class App extends React.Component {
  state = {
    isLoggedIn: false,
    userToken: "",
    userId: ""
  };

  setToken = (token, userId) => {
    localStorage.setItem("pokerToken", token);
    localStorage.setItem("pokerId", userId);
    this.setState({
      isLoggedIn: true,
      userToken: token,
      userId
    });
  };

  logout = () => {
    if (localStorage.getItem("pokerId")) localStorage.removeItem("pokerId");
    if (localStorage.getItem("pokerToken"))
      localStorage.removeItem("pokerToken");
    this.setState({
      isLoggedIn: false,
      userToken: "",
      userId: ""
    });
  };

  async componentDidMount() {
    const dataToken = localStorage.getItem("pokerToken");
    const dataId = localStorage.getItem("pokerId");
    if (dataToken && dataId) {
      const response = await fetch("/api/auth/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: dataToken
        })
      });
      const decoded = await response.json();
      if (decoded.message === "Actual") {
        localStorage.setItem("pokerToken", decoded.newToken);
        this.setState({
          isLoggedIn: true,
          userToken: decoded.newToken,
          userId: dataId
        });
      } else {
        localStorage.removeItem("pokerToken");
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        {!this.state.isLoggedIn ? (
          <Auth onLogin={this.setToken} />
        ) : (
          <React.Fragment>
            <Header onLogout={this.logout} />
            <Switch>
              <Route
                path="/teams-list"
                exact
                render={matchProps => (
                  <TeamsList
                    {...matchProps}
                    {...this.props}
                    token={this.state.userToken}
                  />
                )}
              />
              <Route path="/settings" exact>
                <Settings token={this.state.userToken} />
              </Route>
              <Route
                path="/team/:id"
                exact
                render={matchProps => (
                  <Planning
                    {...matchProps}
                    {...this.props}
                    token={this.state.userToken}
                    userId={this.state.userId}
                  />
                )}
              />
              <Route path="/" exact>
                <TeamsList token={this.state.userToken} />
              </Route>
              <Route
                path="/results"
                exact
                render={matchProps => (
                  <ResultsList
                    {...matchProps}
                    {...this.props}
                    token={this.state.userToken}
                  />
                )}
              />
              <Route
                path="/result/:id"
                exact
                render={matchProps => (
                  <Result
                    {...matchProps}
                    {...this.props}
                    token={this.state.userToken}
                    userId={this.state.userId}
                  />
                )}
              />
              <Redirect to="/" />
            </Switch>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

//TODO: beautify code
//TODO: save voting report to db
