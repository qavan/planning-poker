import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const Header = props => {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand>Poker</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <NavLink className="nav-link" activeClassName="active" to="/" exact>
            Список комнат
          </NavLink>
          <NavLink
            className="nav-link"
            activeClassName="active"
            to="/results"
            exact
          >
            Результаты
          </NavLink>
          <NavLink
            className="nav-link"
            activeClassName="active"
            to="/settings"
            exact
          >
            Настройки
          </NavLink>
        </Nav>
        <Nav>
          <Nav.Link onClick={props.onLogout}>Выйти</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
export default Header;
