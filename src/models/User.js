"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nconf = require("nconf");

const User = sequelize.define("user", {
  pseudo: {
    type: Sequelize.STRING(150),
    index: true,
    allowNull: false,
    validate: {
      len: [4, 128],
    },
  },
  adminLevel: {
    type: Sequelize.INTEGER,
    validation: {
      min: 0,
      max: 3,
      isInt: true,
    },
  },
  email: {
    type: Sequelize.STRING,
    index: true,
    allowNull: false,
    set(val) {
      this.setDataValue("email", val.toLowerCase());
    },
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  invitationToken: {
    type: Sequelize.STRING,
    allowNull: true,
    set() {
      this.setDataValue("invitationToken", this.generateInvitationToken());
    },
  },
  resetPasswordToken: {
    type: Sequelize.STRING,
    allowNull: true,
    set() {
      this.setDataValue("resetPasswordToken", this.generateResetPasswordToken());
    },
  },
  APIKey: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

User.prototype.isValidPassword = async function isValidPassword(pass) {
  const ret = await bcrypt.compare(pass, this.password);
  return ret;
};

User.prototype.setPassword = async function setPassword(pass) {
  this.password = await bcrypt.hash(pass, nconf.get("bcrypt_rounds"));
  this.save();
};

User.prototype.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign({ email: this.email }, nconf.get("JWT_SECRETKEY"), { expiresIn: "1h" });
};

User.prototype.generateInvitationToken = function generateInvitationToken() {
  return jwt.sign({ email: this.email }, nconf.get("JWT_SECRETKEY"), {
    expiresIn: "1h",
  });
};

User.prototype.setInvitationToken = function setInvitationToken() {
  this.setDataValue("invitationToken", this.generateInvitationToken());
  this.save();
};

User.prototype.setResetPasswordToken = function setResetPasswordToken() {
  this.setDataValue("resetPasswordToken", this.generateResetPasswordToken());
  this.save();
};

User.prototype.generateJWT = function generateJWT() {
  return jwt.sign(
    { email: this.email, adminLevel: this.adminLevel, pseudo: this.pseudo },
    nconf.get("JWT_SECRETKEY"),
  );
};

User.prototype.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    adminLevel: this.adminLevel,
    pseudo: this.pseudo,
    invitationToken: this.invitationToken,
    APIKey: this.APIKey,
  };
};

User.prototype.toSessionUser = function toSessionUser() {
  return {
    email: this.email,
    adminLevel: this.adminLevel,
    pseudo: this.pseudo,
    invitationToken: this.invitationToken,
    resetPasswordToken: this.resetPasswordToken,
    id: this.id,
    APIKey: this.APIKey,
  };
};

User.toAuthJSON = function toAuthJSON(user) {
  return {
    email: user.email,
    adminLevel: user.adminLevel,
    pseudo: user.pseudo,
    invitationToken: user.invitationToken,
    resetPasswordToken: user.resetPasswordToken,
    APIKey: user.APIKey,
  };
};

User.prototype.generateInvitationUrl = function generateInvitationUrl() {
  return `${nconf.get("RTFM_HOST")}/invite/${this.invitationToken}`;
};

User.prototype.generateResetPasswordUrl = function generateResetPasswordUrl() {
  return `${nconf.get("RTFM_HOST")}/login/resetPassword/${this.resetPasswordToken}`;
};

module.exports = User;
