"use strict";

require("./src/tools/confSetup");

const app = require("express")();

app.get("/items/:input", (req, res) => {
  res.json([
    {
      input: req.params.input,
      id: 6994,
      name: "Cape Hôte",
      iconId: 17080,
      level: 56,
      description:
        "Cette création hybride entre une hôte et une cape, est franchement étonnante. Si elle avait été confectionnée en cuir, le Captain Chafer l'aurait adorée.",
    },
  ]);
});

app.listen(8080, () => {
  console.log("server running !");
});
