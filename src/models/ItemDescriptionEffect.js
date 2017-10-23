"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const S_Effect = require("./static/S_Effect");
const ObjectEffects = require("../conversion/ObjectEffects");
const DataManager = require("../conversion/DataManager");
const _ = require("lodash");

const ItemDescriptionEffect = sequelize.define(
  "itemDescriptionEffect",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  },
);

ItemDescriptionEffect.belongsTo(S_Effect, {
  as: "effect",
  foreignKey: "effectId",
});

ItemDescriptionEffect.getDescription = function getDescription(effect) {
  let desc = "";
  const instance = ObjectEffects(effect);
  const effectId = effect.actionId;

  const effectModel = _.find(DataManager.Effects, ["id", effectId]);
  if (effectModel === undefined) {
    console.log(effect);
  } else {
    desc = instance.prepareDescription(effectModel.descriptionId_string, effectId);
  }
  return desc;
};

module.exports = ItemDescriptionEffect;
