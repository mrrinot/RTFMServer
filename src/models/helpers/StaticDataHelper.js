"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");
const S_Item = require("../static/S_Item");
const S_ItemType = require("../static/S_ItemType");
const S_Ingredient = require("../static/S_Ingredient");
const S_Recipe = require("../static/S_Recipe");
const S_Effect = require("../static/S_Effect");
const S_Server = require("../static/S_Server");
const S_PossibleEffect = require("../static/S_PossibleEffect");

class StaticDataHelper {
  effects = {};

  static async initStaticDatas() {
    StaticDataHelper.S_Effect = await S_Effect.findAll();
  }
}

StaticDataHelper.initStaticDatas();

module.exports = StaticDataHelper;
