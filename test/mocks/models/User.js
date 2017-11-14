"use strict";

const sequelize = require("../sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nconf = require("nconf");

const User = sequelize.define(
  "user",
  [
    {
      pseudo: "Test User Admin",
      adminLevel: 3,
      email: "admin@test.com",
      password: bcrypt.hashSync("pass", nconf.get("bcrypt_rounds")),
      invitationToken: "",
      resetPasswordToken: "",
      APIKey: "",
    },
  ],
  {
    instanceMethods: {
      isValidPassword: async function isValidPassword(pass) {
        const ret = await bcrypt.compare(pass, this.password);
        return ret;
      },

      setPassword: async function setPassword(pass) {
        this.password = await bcrypt.hash(pass, nconf.get("bcrypt_rounds"));
        this.save();
      },

      generateResetPasswordToken: function generateResetPasswordToken() {
        return jwt.sign({ email: this.email }, nconf.get("JWT_SECRETKEY"), { expiresIn: "1h" });
      },

      generateInvitationToken: function generateInvitationToken() {
        return jwt.sign({ email: this.email }, nconf.get("JWT_SECRETKEY"), {
          expiresIn: "1h",
        });
      },

      setInvitationToken: function setInvitationToken() {
        this.setDataValue("invitationToken", this.generateInvitationToken());
        this.save();
      },

      setResetPasswordToken: function setResetPasswordToken() {
        this.setDataValue("resetPasswordToken", this.generateResetPasswordToken());
        this.save();
      },

      generateJWT: function generateJWT() {
        return jwt.sign(
          { email: this.email, adminLevel: this.adminLevel, pseudo: this.pseudo },
          nconf.get("JWT_SECRETKEY"),
        );
      },

      toAuthJSON: function toAuthJSON() {
        return {
          email: this.email,
          adminLevel: this.adminLevel,
          pseudo: this.pseudo,
          invitationToken: this.invitationToken,
          APIKey: this.APIKey,
        };
      },

      toSessionUser: function toSessionUser() {
        return {
          email: this.email,
          adminLevel: this.adminLevel,
          pseudo: this.pseudo,
          invitationToken: this.invitationToken,
          resetPasswordToken: this.resetPasswordToken,
          id: this.id,
          APIKey: this.APIKey,
        };
      },

      generateInvitationUrl: function generateInvitationUrl() {
        return `${nconf.get("RTFM_HOST")}/invite/${this.invitationToken}`;
      },

      generateResetPasswordUrl: function generateResetPasswordUrl() {
        return `${nconf.get("RTFM_HOST")}/login/resetPassword/${this.resetPasswordToken}`;
      },
    },
  },
);

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

module.exports = User;
