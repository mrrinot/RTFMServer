"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");

const { fn, col, where, and } = Sequelize;

function likeString(clause) {
  return where(fn("lower", col(clause.col)), clause.operator, `%${clause.value}%`);
}

function numberOperator(clause) {
  return where(fn("lower", col(clause.col)), clause.operator, clause.value);
}

function multipleLikeString(clause) {
  const terms = clause.value.replace(/\s+/g, " ").split(" ");
  const whereRet = and(
    ...terms.map(term => {
      if (term[0] === '"' && term[term.length - 1] === '"') {
        return where(
          fn("lower", col(clause.col)),
          "REGEXP",
          `([[:blank:][:punct:]]|^)${term.slice(1, term.length - 1)}([[:blank:][:punct:]]|$)`,
        );
      }
      return where(fn("lower", col(clause.col)), clause.operator, `%${term}%`);
    }),
  );
  return whereRet;
}

const conditionsFunc = {
  name: multipleLikeString,
  description: likeString,
  level: numberOperator,
};

function parseWhere(whereBody) {
  const whereClause = {};
  _.each(whereBody, clause => {
    if (conditionsFunc[clause.col] !== undefined) {
      whereClause[clause.col] = conditionsFunc[clause.col](clause);
    }
  });
  return whereClause;
}

module.exports = parseWhere;
