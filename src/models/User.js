"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

module.exports = sequelize.define("user", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  pseudo: {
    type: Sequelize.STRING(150),
    index: true,
    allowNull: false,
    validate: {
      len: [4, 128],
    },
  },
  email: {
    type: Sequelize.STRING,
    index: true,
    allowNull: false,
    set(val) {
      this.setDataValue("email", val.toLowerCase());
    },
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});
