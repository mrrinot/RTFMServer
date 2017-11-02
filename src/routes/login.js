"use strict";

const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const nconf = require("nconf");
const mailjet = require("node-mailjet").connect(
  nconf.get("MAILJET_APIKEY"),
  nconf.get("MAILJET_APISECRET"),
);
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      const userInfos = {
        email: req.user.email,
        adminLevel: req.user.adminLevel,
        pseudo: req.user.pseudo,
        APIKey: req.user.APIKey,
      };
      return res.json(userInfos);
    });
  })(req, res, next);
});

router.post("/resetPasswordRequest", async (req, res) => {
  const { email } = req.body;
  const acc = await User.find({
    where: {
      email,
    },
  });
  if (acc !== null) {
    acc.setResetPasswordToken();
    const sendMail = mailjet.post("send");
    const emailData = {
      FromEmail: nconf.get("MAILJET_EMAIL"),
      FromName: "RTFM team",
      Subject: "Reset your password, it's free !",
      "Text-Part": `Hello, someone has requested to reset your password, if it's you, please follow this link to proceed: ${acc.generateResetPasswordUrl()}. Otherwise ignore this email`,
      Recipients: [{ Email: acc.email }],
    };
    try {
      await sendMail.request(emailData);
      res.json({});
    } catch (e) {
      res
        .status(400)
        .json({ errors: { global: "An error has occured while sending your invitation's email" } });
    }
  } else {
    res.status(400).json({ errors: { global: "Invalid email" } });
  }
  return null;
});

router.post("/resetPassword", async (req, res) => {
  const { email, password, passwordConfirmation, resetPasswordToken } = req.body;
  jwt.verify(resetPasswordToken, nconf.get("JWT_SECRETKEY"), async err => {
    if (err) {
      res.status(401).json({ errors: { global: "Expired reset token" } });
    } else {
      const acc = await User.find({
        where: {
          email,
          resetPasswordToken,
        },
      });
      acc.setPassword(password);
      res.json(acc.toAuthJSON());
    }
  });
});
module.exports = router;
