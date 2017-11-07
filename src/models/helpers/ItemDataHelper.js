"use strict";

const ItemData = require("../ItemData");
const ItemDescription = require("../ItemDescription");
const StaticDataHelper = require("./StaticDataHelper");
const ItemDescriptionEffect = require("../ItemDescriptionEffect");
const _ = require("lodash");

class ItemDataHelper {
  static async loadItems(items) {
    const datas = await ItemData.bulkCreate(items, { validate: true, returning: true });
    const descriptions = [];
    const effects = [];
    items.forEach((item, key) => {
      item.itemDescriptions.forEach(desc => {
        descriptions.push({ ...desc, itemDatumId: datas[key].id });
      });
    });
    const descDatas = await ItemDescription.bulkCreate(descriptions, {
      validate: true,
      returning: true,
    });

    descriptions.forEach((desc, key) => {
      desc.effects.forEach(effect => {
        if (_.find(StaticDataHelper.Effects, { id: effect.actionId })) {
          effects.push({
            effectId: effect.actionId,
            description: ItemDescriptionEffect.getDescription(effect),
            itemDescriptionId: descDatas[key].id,
          });
        }
      });
    });
    await ItemDescriptionEffect.bulkCreate(effects, { validate: true });
  }
}
module.exports = ItemDataHelper;
