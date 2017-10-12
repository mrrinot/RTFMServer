"use strict";

require("./src/tools/confSetup");
const Sequelize = require("sequelize");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = require("express")();
const serveStatic = require("serve-static");
const decode = require("jwt-decode");
const Item = require("./src/models/Item");
const User = require("./src/models/User");
const mailjet = require("node-mailjet").connect(
  nconf.get("MAILJET_APIKEY"),
  nconf.get("MAILJET_APISECRET"),
);
const jwt = require("jsonwebtoken");

app.use(bodyParser.json());

let iconsPath = nconf.get("iconsPath");

if (iconsPath) {
  iconsPath = path.resolve(process.cwd(), iconsPath);
  if (fs.existsSync(iconsPath) && fs.lstatSync(iconsPath).isDirectory()) {
    winston.info(`Using ${iconsPath} as icon directory.`);
    app.use("/img/", serveStatic(iconsPath));
  }
}

const { Op, fn, col, where } = Sequelize;

app.get("/items/:input", async (req, res) => {
  const inputValue = req.params.input.toLowerCase();

  const items = await Item.findAll({
    where: {
      name: where(fn("lower", col("name")), "LIKE", `%${inputValue}%`),
    },
    limit: 50,
  });
  res.json(items);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const account = await User.find({
    where: {
      email,
    },
  });
  if (account !== null) {
    const isValid = await account.isValidPassword(password);
    if (isValid) {
      res.json(account.toAuthJSON());
    } else {
      res.status(400).json({ errors: { global: "Invalid credentials" } });
    }
  } else {
    res.status(400).json({ errors: { global: "This email isn't linked to any account" } });
  }
});

app.post("/invite/:token", (req, res) => {
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

app.post("/invite", async (req, res) => {
  const { token, email, adminLevel } = req.body;
  const payload = decode(token);
  const userInfos = {
    email: payload.email,
    adminLevel: payload.adminLevel,
  };
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
    const accs = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        pseudo: "PLACEHOLDER_PSEUDO",
        adminLevel,
        email,
        password: "",
      },
    });
    const invitedAccount = accs[0];
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

app.listen(8080, () => {
  winston.info("server running !");
});
