import React from "react";
import { MarksList } from "../MarksList/MarksList";
import { Results } from "../Results/Results";
import { AdminButtonsStop } from "../AdminButtonsStop/AdminButtonsStop";

export const PlanningVoting = props => {
  const calcAverage = () => {
    if (!props.currentState) {
      return "Не известно";
    }
    let summ = 0;
    let counter = 0;
    for (let user of props.currentState.users) {
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
      <h4 className="text-center title">Планирование</h4>
      <h5 className="text-center title">
        Текущая тема: <b>{props.theme ? props.theme : "Не указана"}</b>
      </h5>
      <h6 className="text-center title">Ожидание окончания голосования</h6>
      {!props.userVoted ? (
        <MarksList marks={props.marks} onVote={props.setVote} />
      ) : null}
      <Results results={props.currentState} />
      <h6 className="text-center title">Среднее: {calcAverage()}</h6>
      {props.showAdminButtons ? (
        <AdminButtonsStop onStop={props.stopVoting} />
      ) : null}
    </React.Fragment>
  );
};
