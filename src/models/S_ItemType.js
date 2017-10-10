"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const S_ItemType = sequelize.define(
  "s_itemType",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      defaultValue: "NONAME",
    },
  },
  {
    timestamps: false,
  },
);

S_ItemType.convert = function convertItemType(itemType) {
  return {
    id: itemType.id,
    name: itemType.nameId_string,
  };
};

module.exports = S_ItemType;
