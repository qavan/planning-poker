import React from "react";
import classes from "./UserTeamsList.module.sass";
import { Row, Col, Table } from "react-bootstrap";

export const UserTeamsList = props => {
  return (
    <Row>
      <Col>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Название команды</th>
              <th>Удаление</th>
            </tr>
          </thead>
          <tbody>
            {props.teamsList.map(team => {
              return (
                <tr key={team.teamId}>
                  <td>{team.teamName}</td>
                  <td
                    className={classes.deleteTeam}
                    onClick={() => props.onDelete(team.teamId)}
                  >
                    Удалить
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};
