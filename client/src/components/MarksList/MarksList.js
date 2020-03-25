import React from "react";
import { ListGroup } from "react-bootstrap";

export const MarksList = props => {
  return (
    <ListGroup style={{ margin: "20px 0" }}>
      {props.marks.map((item, index) => {
        return (
          <ListGroup.Item key={index} onClick={() => props.onVote(item)} action>
            {item}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};
