"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const S_Effect = require("./static/S_Effect");
const ObjectEffects = require("../conversion/ObjectEffects");
const DataManager = require("../conversion/DataManager");
const _ = require("lodash");

module.exports = function ItemDescriptionEffect(date) {
  const effectInstance = sequelize.define(
    `itemDescriptionEffect_${date}`,
    {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        index: true,
      },
    },
    {
      timestamps: false,
      tableName: `itemDescriptionEffect_${date}`,
    },
  );

  effectInstance.belongsTo(S_Effect, {
    as: "effect",
    foreignKey: "effectId",
    constraints: false,
  });

  effectInstance.getDescription = function getDescription(effect) {
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
  return effectInstance;
};
