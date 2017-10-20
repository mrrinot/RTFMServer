"use strict";

const express = require("express");
const User = require("../models/User");
const ItemData = require("../models/ItemData");
const ItemDescription = require("../models/ItemDescription");

const router = express.Router();

router.post("/", async (req, res) => {
  const account = await User.find({ where: { APIKey: req.body.APIKey } });
  if (account !== null) {
    const datas = await ItemData.bulkCreate(req.body.items, { validate: true, returning: true });
    const descriptions = [];
    req.body.items.forEach((item, key) => {
      item.itemDescriptions.forEach(desc =>
        descriptions.push({ ...desc, itemDatumId: datas[key].id }),
      );
    });
    await ItemDescription.bulkCreate(descriptions, { validate: true });
    console.log(
      `Done inserting ${req.body.items.length} items with ${descriptions.length} descriptions`,
    );
    res.json({});
  } else {
    res.status(401).json({ errors: { global: "Not authorized" } });
  }
});

module.exports = router;
