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
const { requireGuest, requiredAdminLevel } = require("../middlewares");

const router = express.Router();

router.post("/login", requireGuest, (req, res, next) => {
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
      return res.json(User.toAuthJSON(user));
    });
  })(req, res, next);
});

router.post("/resetPasswordRequest", requireGuest, async (req, res) => {
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

router.post("/resetPassword", requireGuest, async (req, res) => {
  const { email, password, resetPasswordToken } = req.body;
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

router.post("/logout", requiredAdminLevel(1), (req, res) => {
  req.session.destroy();
  res.json({});
});

router.post("/isLoggedIn", (req, res) => {
  if (!req.isAuthenticated() || req.session.passport.user.email !== req.body.email) {
    res.status(400).json({ errors: { global: "You aren't you !" } });
  } else {
    res.json(User.toAuthJSON(req.session.passport.user));
  }
});
module.exports = router;
