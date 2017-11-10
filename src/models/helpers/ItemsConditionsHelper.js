"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");

const { fn, col, where, and } = Sequelize;

function likeString(clause) {
  return where(col(clause.col), clause.operator, `%${clause.value}%`);
}

function numberOperator(clause) {
  return where(col(clause.col), clause.operator, clause.value);
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
      return where(col(clause.col), clause.operator, `%${term}%`);
    }),
  );
  return whereRet;
}

const ItemFunc = {
  name: multipleLikeString,
  description: likeString,
  level: numberOperator,
  typeId: numberOperator,
};

const DataFunc = {
  averagePrice: numberOperator,
};

function parseWhere(whereBody) {
  const whereClause = { Item: {}, Data: {} };
  _.each(whereBody, clause => {
    if (ItemFunc[clause.col] !== undefined) {
      whereClause.Item[clause.col] = ItemFunc[clause.col](clause);
    }
    if (DataFunc[clause.col] !== undefined) {
      whereClause.Data[clause.col] = DataFunc[clause.col](clause);
    }
  });
  return whereClause;
}

module.exports = { parseWhere };
