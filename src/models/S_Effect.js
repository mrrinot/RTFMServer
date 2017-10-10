"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const S_Effect = sequelize.define(
  "s_effect",
  {
    text: {
      type: Sequelize.STRING,
    },
    min: {
      type: Sequelize.INTEGER,
    },
    max: {
      type: Sequelize.INTEGER,
    },
    sign: {
      type: Sequelize.STRING(1),
      validate: {
        isIn: ["+", "-"],
      },
    },
  },
  {
    timestamps: false,
  },
);

S_Effect.convert = function convertS_Effect(effect) {
  return {
    id: effect.id,
    name: effect.nameId_string,
  };
};

module.exports = S_Effect;
