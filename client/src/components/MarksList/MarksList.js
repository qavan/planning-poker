import React from "react";
import { ListGroup } from "react-bootstrap";

export const MarksList = props => {
  return (
    <ListGroup>
      {props.marks.map((item, index) => {
        return (
          <ListGroup.Item key={index} action>
            {item}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};
