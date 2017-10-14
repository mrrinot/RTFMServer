"use strict";

const express = require("express");
const User = require("../models/User");
const nconf = require("nconf");
const mailjet = require("node-mailjet").connect(
  nconf.get("MAILJET_APIKEY"),
  nconf.get("MAILJET_APISECRET"),
);
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/:token", (req, res) => {
  const { email, password, pseudo, invitationToken } = req.body;
  jwt.verify(invitationToken, nconf.get("JWT_SECRETKEY"), async err => {
    if (err) {
      res.status(401).json({ errors: { global: "Expired validation token" } });
    } else {
      const acc = await User.find({
        where: {
          email,
        },
      });
      acc.setPassword(password);
      acc.pseudo = pseudo;
      acc.save();
      res.json(acc.toAuthJSON());
    }
  });
});

router.post("/", async (req, res) => {
  const { email, adminLevel, userInfos } = req.body;
  const senderAccount = await User.find({
    where: {
      email: userInfos.email,
    },
  });
  if (senderAccount !== null) {
    if (senderAccount.adminLevel < 3) {
      return res
        .status(401)
        .json({ errors: { global: "You do not have the required admin level for this query" } });
    }
    const invitedAccount = (await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        pseudo: "PLACEHOLDER_PSEUDO",
        adminLevel,
        email,
        password: "",
      },
    }))[0];
    invitedAccount.setInvitationToken();
    invitedAccount.adminLevel = adminLevel;
    invitedAccount.save();
    const sendMail = mailjet.post("send");
    const emailData = {
      FromEmail: "Rinot95@gmail.com",
      FromName: senderAccount.pseudo,
      Subject: "You have been invited to RTFM",
      "Text-Part": `Hello, you have been invited to RTFM, follow this link to create your account : ${invitedAccount.generateInvitationUrl()}`,
      Recipients: [{ Email: invitedAccount.email }],
    };
    try {
      await sendMail.request(emailData);
      res.json(invitedAccount.toAuthJSON());
    } catch (e) {
      res
        .status(400)
        .json({ errors: { global: "An error has occured while sending your invitation's email" } });
    }
  } else {
    res.status(400).json({ errors: { global: "Invalid invite sender" } });
  }
  return null;
});

module.exports = router;
