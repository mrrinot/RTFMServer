"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

module.exports = function ItemDescription(date, effectInstance) {
  const descInstance = sequelize.define(
    `itemDescription_${date}`,
    {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      objectUID: {
        type: Sequelize.INTEGER,
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
      tableName: `itemDescription_${date}`,
    },
  );

  descInstance.hasMany(effectInstance, {
    as: "effects",
    foreignKey: "itemDescriptionId",
  });
  return descInstance;
};
