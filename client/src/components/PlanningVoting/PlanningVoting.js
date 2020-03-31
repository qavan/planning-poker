import React from "react";
import classes from "./PlanningVoting.module.sass";
import { MarksList } from "../MarksList/MarksList";
import { Results } from "../Results/Results";
import { AdminButtonsStop } from "../AdminButtonsStop/AdminButtonsStop";

export const PlanningVoting = props => {
  return (
    <React.Fragment>
      <h4 className={`text-center ${classes.title}`}>Планирование</h4>
      <h5 className={`text-center ${classes.title}`}>
        Текущая тема: <b>{props.theme ? props.theme : "Не указана"}</b>
      </h5>
      <h6 className={`text-center ${classes.title}`}>
        Ожидание окончания голосования
      </h6>
      {!props.userVoted ? (
        <MarksList marks={props.marks} onVote={props.setVote} />
      ) : null}
      <Results results={props.currentState} />
      {props.showAdminButtons ? (
        <AdminButtonsStop onStop={props.stopVoting} />
      ) : null}
    </React.Fragment>
  );
};
