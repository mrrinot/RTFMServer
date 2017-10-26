"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");

const { fn, col, where, Op } = Sequelize;

function likeString(clause) {
  return where(fn("lower", col(clause.col)), clause.operator, `%${clause.value}%`);
}

function numberOperator(clause) {
  return where(col(clause.col), clause.operator, clause.value);
}

const conditionsFunc = {
  name: likeString,
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
