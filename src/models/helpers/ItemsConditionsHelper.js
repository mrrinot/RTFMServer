"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");

const { fn, col, where, and, or } = Sequelize;

function logicBuilder(clauseArray, logic, cb) {
  return logic(clauseArray.map(clause => cb(clause)));
}

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

function orderBy(clause) {
  return [clause.operator, clause.value];
}

const ItemFunc = {
  name: { cb: multipleLikeString, logic: arr => or(...arr) },
  description: { cb: likeString, logic: arr => or(...arr) },
  level: { cb: numberOperator, logic: arr => and(...arr) },
  typeId: { cb: numberOperator, logic: arr => or(...arr) },
};

const DataFunc = {
  averagePrice: { cb: numberOperator, logic: arr => and(...arr) },
};

const RecipeFunc = {
  containsActualUnknown: { cb: numberOperator, logic: arr => or(...arr) },
  containsAverageUnknown: { cb: numberOperator, logic: arr => or(...arr) },
};

const OrderFunc = {
  orderBy: { cb: orderBy, logic: arr => arr },
};

function parseWhere(whereBody) {
  const whereClause = { Item: {}, Data: {}, Recipe: {}, Order: [] };
  const grouped = _.groupBy(whereBody, clause => clause.col);
  _.forEach(grouped, (clause, name) => {
    const item = ItemFunc[name];
    const data = DataFunc[name];
    const recipe = RecipeFunc[name];
    const order = OrderFunc[name];
    if (item !== undefined) {
      whereClause.Item[name] = logicBuilder(clause, item.logic, item.cb);
    }
    if (data !== undefined) {
      whereClause.Data[name] = logicBuilder(clause, data.logic, data.cb);
    }
    if (recipe !== undefined) {
      whereClause.Recipe[name] = logicBuilder(clause, recipe.logic, recipe.cb);
    }
    if (order !== undefined) {
      whereClause.Order = logicBuilder(clause, order.logic, order.cb);
    }
  });
  return whereClause;
}

module.exports = { parseWhere };
