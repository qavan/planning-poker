import React from "react";
import { Table } from "react-bootstrap";

export const Results = props => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Пользователь</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        {props.results.users.map((item, index) => {
          return (
            <tr key={index}>
              <th>{item.name}</th>
              <th>{item.status}</th>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
