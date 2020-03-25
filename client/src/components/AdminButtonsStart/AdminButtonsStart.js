import React from "react";
import { Button } from "react-bootstrap";

export const AdminButtonsStart = props => {
  return (
    <React.Fragment>
      <Button variant="secondary" onClick={() => props.onStart()}>
        Начать голосование
      </Button>
    </React.Fragment>
  );
};
