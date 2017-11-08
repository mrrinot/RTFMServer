"use strict";

exports.requiredAdminLevel = lvlMin => (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.session.passport.user.adminLevel >= lvlMin) {
      return next();
    }
    return res
      .status(403)
      .json({ errors: { global: "You do not have permission to access this page." } });
  }
  res.status(401).json({ errors: { global: "Please login." } });
};

exports.requireGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({ errors: { global: "You are already logged in." } });
};
