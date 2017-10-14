"use strict";

const express = require("express");
const passport = require("passport");

const router = express.Router();

// router.post("/", passport.authenticate("local"), async (req, res) => {
//   const userInfos = {
//     email: req.user.email,
//     adminLevel: req.user.adminLevel,
//     pseudo: req.user.pseudo,
//   };
//   res.json(userInfos);
// });

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
      };
      return res.json(userInfos);
    });
  })(req, res, next);
});

module.exports = router;
