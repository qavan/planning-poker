import React from "react";
import classes from "./PlanningWaiting.module.sass";
import { AdminButtonsStart } from "../AdminButtonsStart/AdminButtonsStart";
import { Results } from "../Results/Results";

export const PlanningWaiting = props => {
  return (
    <React.Fragment>
      <h4 className={`text-center ${classes.title}`}>
        Ожидание начала голосования
      </h4>
      <h5 className={`text-center ${classes.title}`}>
        Текущая тема: <b>{props.theme ? props.theme : "Не указана"}</b>
      </h5>
      <h6 className={`text-center ${classes.title}`}>
        Результат последнего голосования
      </h6>
      <Results results={props.lastState} />
      {props.showAdminButtons ? (
        <AdminButtonsStart onStart={props.startVoting} />
      ) : null}
    </React.Fragment>
  );
};
