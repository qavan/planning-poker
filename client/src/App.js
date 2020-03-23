import React from "react";
import Auth from "./containers/Auth/Auth";
import Header from "./components/Header/Header";
import TeamsList from "./containers/TeamsList/TeamsList";
import Settings from "./containers/Settings/Settings";
import Planning from "./containers/Planning/Planning";
import { Switch, Route, Redirect } from "react-router-dom";

export default class App extends React.Component {
  state = {
    isLoggedIn: false,
    userToken: ""
  };

  setToken = token => {
    localStorage.setItem("pokerToken", token);
    this.setState({
      isLoggedIn: true,
      userToken: token
    });
  };

  async componentDidMount() {
    const data = localStorage.getItem("pokerToken");
    if (data) {
      const response = await fetch("/api/auth/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: data
        })
      });
      const decoded = await response.json();
      if (decoded.message === "Actual") {
        this.setState({
          isLoggedIn: true,
          userToken: data
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
            <Header />
            <Switch>
              <Route path="/teams-list" exact>
                <TeamsList token={this.state.userToken} />
              </Route>
              <Route path="/settings" exact>
                <Settings />
              </Route>
              <Route path="/team/:id" exact>
                <Planning />
              </Route>
              <Route path="/" exact>
                <TeamsList token={this.state.userToken} />
              </Route>
              <Redirect to="/" />
            </Switch>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
