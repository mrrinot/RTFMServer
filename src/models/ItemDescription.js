"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const ItemDescriptionEffect = require("./ItemDescriptionEffect");

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
  },
  {
    timestamps: false,
  },
);

ItemDescription.hasMany(ItemDescriptionEffect, {
  as: "effects",
});

module.exports = ItemDescription;
