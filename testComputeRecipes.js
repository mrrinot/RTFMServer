/* eslint-disable */

"use strict";

require("./src/tools/confSetup");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const sequelize = require("./src/sequelize");
const RecipeCostHelper = require("./src/models/helpers/RecipeCostHelper");
const ItemDataHelper = require("./src/models/helpers/ItemDataHelper");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const _ = require("lodash");
main();

async function main() {
  winston.info("Sync database");
  await ItemDataHelper.loadAllModels();
  await RecipeCostHelper.loadAllModels();
  await sequelize.sync({ force: false });
  winston.info("Starting recipe compute");
  await RecipeCostHelper.computeAllRecipeCost();
  winston.info("Everything went fine. Exiting...");
  await sequelize.connectionManager.close();
  winston.info("Bye!");
}
