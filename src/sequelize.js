"use strict";

const Sequelize = require("sequelize");
const nconf = require("nconf");
const winston = require("winston");

winston.verbose(`DB_HOST: ${nconf.get("DB_HOST")}`);
winston.verbose(`DB_PORT: ${nconf.get("DB_PORT")}`);

module.exports = new Sequelize(
  nconf.get("DB_NAME"),
  nconf.get("DB_USERNAME"),
  nconf.get("DB_PASSWORD"),
  {
    host: nconf.get("DB_HOST"),
    port: nconf.get("DB_PORT"),
    dialect: nconf.get("DB_DIALECT"),
    operatorsAliases: false,

    pool: {
      max: 5,
      min: 0,
      idle: 30 * 60 * 1000,
    },

    logging: winston.verbose,
  },
);
