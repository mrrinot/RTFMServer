"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const S_Effect = sequelize.define(
  "s_effect",
  {
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    boost: {
      type: Sequelize.BOOLEAN,
    },
    bonusType: {
      type: Sequelize.INTEGER,
    },
    useInFight: {
      type: Sequelize.BOOLEAN,
    },
  },
  {
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
);

S_Effect.convert = function convertS_Effect(effect) {
  return {
    id: effect.id,
    description: effect.descriptionId_string || "",
    boost: effect.boost,
    bonusType: effect.bonusType,
    useInFight: effect.useInFight,
  };
};

module.exports = S_Effect;
