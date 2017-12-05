"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");
const S_ItemType = require("./S_ItemType");
const S_PossibleEffect = require("./S_PossibleEffect");
const CriterionConverter = require("../../conversion/CriterionConverter");

const S_Item = sequelize.define(
  "s_item",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    iconId: {
      type: Sequelize.INTEGER,
    },
    level: {
      type: Sequelize.INTEGER,
    },
    name: {
      index: true,
      type: Sequelize.STRING,
    },
    criticalHitProbability: {
      type: Sequelize.INTEGER,
    },
    criteria: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue("criteria", CriterionConverter.ConvertCriterion(val));
      },
    },
    etheral: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    weight: {
      type: Sequelize.INTEGER,
    },
    range: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    minRange: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    apCost: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    criticalHitBonus: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    maxCastPerTurn: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
  },
  {
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
);

S_Item.belongsTo(S_ItemType, {
  as: "type",
  foreignKey: "typeId",
  constraints: false,
});

S_Item.hasMany(S_PossibleEffect, {
  as: "possibleEffects",
  constraints: false,
});

S_Item.convert = function convertItem(item) {
  return {
    id: item.id,
    iconId: item.iconId,
    level: item.level,
    name: item.nameId_string,
    criticalHitProbability: item.criticalHitProbability,
    criteria: item.criteria,
    weight: item.realWeight,
    etheral: item.etheral,
    description: item.descriptionId_string,
    range: item.range,
    minRange: item.minRange,
    criticalHitBonus: item.criticalHitBonus,
    apCost: item.apCost,
    maxCastPerTurn: item.maxCastPerTurn,
    typeId: item.typeId,
  };
};

module.exports = S_Item;
