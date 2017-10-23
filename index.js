"use strict";

require("./src/tools/confSetup");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = require("express")();
const session = require("express-session");
const serveStatic = require("serve-static");
const User = require("./src/models/User");
const login = require("./src/routes/login");
const invite = require("./src/routes/invite");
const items = require("./src/routes/items");
const itemStat = require("./src/routes/itemStat");
const APIKey = require("./src/routes/APIKey");
const itemData = require("./src/routes/itemData");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      const account = await User.find({
        where: {
          email: username,
        },
      });
      if (account !== null) {
        const isValid = await account.isValidPassword(password);
        if (isValid) {
          return done(null, account.toSessionUser());
        }
        return done(null, false, { errors: { global: "Incorrect password" } });
      }
      return done(null, false, { errors: { global: "User not found" } });
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  const account = await User.findById(user.id);
  if (account !== null) {
    done(null, account);
  } else {
    done(new Error("Account not found"), {});
  }
});

app.use(bodyParser.json());
app.use(
  session({
    secret: nconf.get("SESSION_SECRET"),
    proxy: true,
    cookie: { maxAge: 1000 * 60 * 60 },
    saveUninitialized: false,
    resave: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/login", login);
app.use("/api/items", items);
app.use("/api/invite", invite);
app.use("/api/createAPIKey", APIKey);
app.use("/api/itemData", itemData);
app.use("/api/itemStat", itemStat);

let iconsPath = nconf.get("iconsPath");

if (iconsPath) {
  iconsPath = path.resolve(process.cwd(), iconsPath);
  if (fs.existsSync(iconsPath) && fs.lstatSync(iconsPath).isDirectory()) {
    winston.info(`Using ${iconsPath} as icon directory.`);
    app.use("/img/", serveStatic(iconsPath));
  } else {
    winston.warn(`${iconsPath} is not a valid directory. Skipping images`);
  }
}

if (nconf.get("prod") === true) {
  winston.info(`Using ${path.join(__dirname, "build")} to serve client.`);
  app.use("*", serveStatic(path.join(__dirname, "build")));
}

const port = nconf.get("PORT");
app.listen(port, () => {
  winston.info(`Server running on port ${port} !`);
});
