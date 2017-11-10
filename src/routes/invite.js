"use strict";

const express = require("express");
const User = require("../models/User");
const nconf = require("nconf");
const mailjet = require("node-mailjet").connect(
  nconf.get("MAILJET_APIKEY"),
  nconf.get("MAILJET_APISECRET"),
);
const jwt = require("jsonwebtoken");
const { requiredAdminLevel, requireGuest } = require("../middlewares");

const router = express.Router();

router.post("/:token", requireGuest, (req, res) => {
  const { email, password, pseudo, invitationToken } = req.body;
  jwt.verify(invitationToken, nconf.get("JWT_SECRETKEY"), async err => {
    if (err) {
      res.status(401).json({ errors: { global: "Expired validation token" } });
    } else {
      const acc = await User.find({
        where: {
          email,
          invitationToken,
        },
      });
      acc.setPassword(password);
      acc.pseudo = pseudo;
      acc.save();
      res.json(acc.toAuthJSON());
    }
  });
});

router.post("/", requiredAdminLevel(3), async (req, res) => {
  const { email, adminLevel } = req.body;
  const senderAccount = req.session.passport.user;
  if (senderAccount !== null) {
    const invitedAccount = (await User.findOrCreate({
      where: {
        email,
        pseudo: "PLACEHOLDER_PSEUDO",
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
      FromEmail: nconf.get("MAILJET_EMAIL"),
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
