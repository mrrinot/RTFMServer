"use strict";

const Sequelize = require("sequelize");
const _ = require("lodash");
const sequelize = require("../sequelize");
const ObjectEffects = require("../conversion/ObjectEffects");
const DataManager = require("../conversion/DataManager");

const ItemDescription = sequelize.define(
  "itemDescription",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    objectUID: {
      type: Sequelize.INTEGER,
      index: true,
    },
    prices: {
      type: Sequelize.STRING,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("prices"));
      },
      set(value) {
        this.setDataValue("prices", `[${value.join(",")}]`);
      },
    },
    effects: {
      type: Sequelize.TEXT,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("effects"));
      },
      set(value) {
        const effects = value.map(effect => {
          const instance = ObjectEffects(effect);
          const effectId = effect.actionId;

          const effectModel = _.find(DataManager.Effects, ["id", effectId]);
          if (effectModel === undefined) {
            console.log(effect);
            return { ...effect, description: "" };
          }
          const description = instance.prepareDescription(
            effectModel.descriptionId_string,
            effectId,
          );
          return { ...effect, description };
        });
        this.setDataValue("effects", JSON.stringify(effects));
      },
    },
  },
  {
    timestamps: false,
  },
);

module.exports = ItemDescription;
