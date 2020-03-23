import React from "react";
import classes from "./Loader.module.sass";
import { Spinner } from "react-bootstrap";

export const Loader = () => {
  return (
    <div className={classes.Loader}>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
};
