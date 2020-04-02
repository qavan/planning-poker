import React from "react";
import classes from "./PlanningWaiting.module.sass";
import { AdminButtonsStart } from "../AdminButtonsStart/AdminButtonsStart";
import { Results } from "../Results/Results";

export const PlanningWaiting = props => {
  const calcAverage = () => {
    if (!props.lastState) {
      return "Не известно";
    }
    let summ = 0;
    let counter = 0;
    for (let user of props.lastState.users) {
      if (parseInt(user.status)) {
        summ += parseInt(user.status);
        counter++;
      }
    }
    if (counter) {
      return summ / counter;
    }
    return "Не известно";
  };

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
      <h6 className={`text-center ${classes.title}`}>
        Среднее: {calcAverage()}
      </h6>
      {props.showAdminButtons ? (
        <AdminButtonsStart onStart={props.startVoting} />
      ) : null}
    </React.Fragment>
  );
};
