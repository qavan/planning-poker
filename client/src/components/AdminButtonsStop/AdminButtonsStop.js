import React from "react";
import { Button } from "react-bootstrap";

export const AdminButtonsStop = props => {
  return (
    <React.Fragment>
      <Button variant="secondary" onClick={() => props.onStop()}>
        Закончить голосование
      </Button>
    </React.Fragment>
  );
};
