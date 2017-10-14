"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");
const DataManager = require("../../conversion/DataManager");
const EffectInstance = require("../../conversion/EffectInstance");
const sequelize = require("../../sequelize");
const S_Effect = require("./S_Effect");

const S_PossibleEffect = sequelize.define(
  "s_possibleEffect",
  {
    min: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    characteristic: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    max: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    value: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    description: {
      type: Sequelize.STRING,
      defaultValue: "",
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

S_PossibleEffect.belongsTo(S_Effect, {
  as: "effect",
  foreignKey: "effectId",
});

let effects;
S_PossibleEffect.convert = function convertS_PossibleEffect(effect) {
  if (!effects) {
    effects = DataManager.Effects;
  }

  const { diceNum: min, diceSide: max, value, effectId } = effect;

  const effectModel = _.find(effects, ["id", effectId]);

  const effectInstance = new EffectInstance(min, max, value);
  const descrToDo = effectModel.theoreticalDescriptionId_string || effectModel.descriptionId_string;
  const description = effectInstance.prepareDescription(descrToDo, effectId);

  return {
    min,
    max,
    description,
    characteristic: effectModel.characteristic,
    value,
    effectId,
  };
};

module.exports = S_PossibleEffect;
