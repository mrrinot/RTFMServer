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
const _ = require("lodash");
main();

async function main() {
  winston.info("Sync database");
  await sequelize.sync({ force: false });
  if (!nconf.get("jsonPath")) {
    winston.error("jsonPath not specified, expected a folder");
    await sequelize.connectionManager.close();
    process.exit(2);
  }
  winston.info("Starting json upload");
  const jsonPath = path.resolve(nconf.get("base_dir"), nconf.get("jsonPath"));
  const dir = fs.readdirSync(jsonPath);
  let packedItems = [];
  await async.eachOfSeriesAsync(
    _.sortBy(dir, [
      file => {
        if (path.extname(file) === ".json") {
          return file.match(/output_\d{4}_\d{2}_\d{2}_(\d{2}).json/)[1];
        }
        return 0;
      },
    ]),
    async (file, key) => {
      if (path.extname(file) === ".json") {
        packedItems = _.concat(packedItems, require(path.join(jsonPath, file)));
        winston.info(`Added file: ${file}, key = ${key}`);
      }
      if (key % 8 === 0 && key > 0) {
        winston.info("Loading 8 files");
        await ItemDataHelper.loadItems(packedItems);
        winston.info("data added in database");
        packedItems = [];
      }
    },
  );
  if (packedItems.length > 0) {
    await ItemDataHelper.loadItems(packedItems);
    winston.info("data added in database");
  }
  winston.info("Everything went fine. Exiting...");
  await sequelize.connectionManager.close();
  winston.info("Bye!");
}
