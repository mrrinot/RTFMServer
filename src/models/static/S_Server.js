"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const S_Server = sequelize.define(
  "s_server",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      index: true,
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  },
);

S_Server.convert = function convertServer(server) {
  return {
    id: server.id,
    name: server.nameId_string,
  };
};
module.exports = S_Server;
