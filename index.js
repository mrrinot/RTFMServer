"use strict";

require("./src/tools/confSetup");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const redis = require("redis");
const app = require("express")();
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const serveStatic = require("serve-static");
const User = require("./src/models/User");
const auth = require("./src/routes/auth");
const invite = require("./src/routes/invite");
const items = require("./src/routes/items");
const itemStat = require("./src/routes/itemStat");
const APIKey = require("./src/routes/APIKey");
const ItemDataHelper = require("./src/models/helpers/ItemDataHelper");
const RecipeCostHelper = require("./src/models/helpers/RecipeCostHelper");
const itemData = require("./src/routes/itemData");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { requiredAdminLevel } = require("./src/middlewares");

ItemDataHelper.loadAllModels();
RecipeCostHelper.loadAllModels();
let morgan;
if (nconf.get("NODE_ENV") === "test") {
  morgan = require("morgan"); // eslint-disable-line
}

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
    done(null, account.toSessionUser());
  } else {
    done(new Error("Account not found"), {});
  }
});
const client = redis.createClient({
  host: nconf.get("RTFMREDIS_HOST"),
  port: nconf.get("RTFMREDIS_PORT"),
});
client.auth(nconf.get("RTFMREDIS_PASSWORD"));

if (morgan) {
  app.use(morgan("combined"));
}

app.use(bodyParser.json());
app.use(
  session({
    store: new RedisStore({
      logErrors: true,
      client,
      ttl: 3600,
    }),
    secret: nconf.get("SESSION_SECRET"),
    proxy: true,
    cookie: { maxAge: 1000 * 60 * 60 },
    saveUninitialized: false,
    resave: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", auth);
app.use("/api/items", requiredAdminLevel(1), items);
app.use("/api/invite", invite);
app.use("/api/createAPIKey", requiredAdminLevel(2), APIKey);
app.use("/api/itemData", itemData);
app.use("/api/itemStat", requiredAdminLevel(1), itemStat);

let iconsPath = nconf.get("iconsPath");

if (iconsPath) {
  iconsPath = path.resolve(process.cwd(), iconsPath);
  if (fs.existsSync(iconsPath) && fs.lstatSync(iconsPath).isDirectory()) {
    winston.info(`Using ${iconsPath} as icon directory.`);
    app.use("/img/", serveStatic(iconsPath));
  } else {
    winston.warn(`${iconsPath} is not a valid directory. Skipping images`);
  }
} else {
  winston.warn(`iconsPath is not set. Skipping images`);
}

if (nconf.get("prod") === true) {
  const buildDir = path.join(__dirname, "build");
  const indexFile = fs.readFileSync(path.join(buildDir, "index.html"));
  winston.info(`Using ${buildDir} to serve client.`);
  app.use(serveStatic(buildDir), (req, res) => {
    res.end(indexFile);
  });
}

const port = nconf.get("PORT");
app.listen(port, () => {
  winston.info(`Server running on port ${port} !`);
});

module.exports = app;
