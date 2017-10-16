"use strict";

const path = require("path");
const nconf = require("nconf");
const winston = require("winston");

if (!nconf.get("langPath")) {
  winston.error("You forgot the option --langPath to specify the translation");
} else {
  const langPath = path.resolve(process.cwd(), nconf.get("langPath"));
  winston.info(`Loading lang from ${langPath}`);
  const langData = require(langPath); // eslint-disable-line

  const replaceParams = (str, args, prefix = "%") => {
    if (!args || !Array.isArray(args)) {
      return str;
    }

    let result = str;
    args.forEach((arg, index) => {
      result = result.replace(new RegExp(`${prefix}${index + 1}`, "g"), arg);
    });
    return result;
  };

  module.exports = class I18n {
    static getText(param1, param2 = null) {
      if (!param1) {
        return null;
      }
      const str = langData.stringByID[param1];
      if (str === null || str === "null") {
        return `[UNKNOWN_TEXT_ID_${param1}]`;
      }
      return replaceParams(str, param2);
    }

    static getUiText(param1, param2 = null) {
      const str = langData.stringByStringID[param1];
      if (str === null || str === "null") {
        return `[UNKNOWN_TEXT_NAME_${param1}]`;
      }
      return replaceParams(str, param2);
    }
  };
}
