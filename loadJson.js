/* eslint-disable */

"use strict";

require("./src/tools/confSetup");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const sequelize = require("./src/sequelize");
const ItemDataHelper = require("./src/models/helpers/ItemDataHelper");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));

main();

async function main() {
  if (!nconf.get("jsonPath")) {
    winston.error("jsonPath not specified, expected a folder");
    await sequelize.connectionManager.close();
    process.exit(2);
  }
  winston.info("Starting json upload");
  const jsonPath = path.resolve(nconf.get("base_dir"), nconf.get("jsonPath"));
  const dir = fs.readdirSync(jsonPath);
  await async.eachSeriesAsync(dir, async file => {
    if (path.extname(file) === ".json") {
      winston.info(`Uploading file ${file}`);
      const data = require(path.join(jsonPath, file));
      await ItemDataHelper.loadItems(data);
    }
  });
  winston.info("Everything went fine. Exiting...");
  await sequelize.connectionManager.close();
  winston.info("Bye!");
}
