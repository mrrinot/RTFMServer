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
  },
  {
    timestamps: false,
  },
);

S_Effect.convert = function convertS_Effect(effect) {
  return {
    id: effect.id,
    description: effect.descriptionId_string || "",
  };
};

module.exports = S_Effect;
