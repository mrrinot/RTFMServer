"use strict";

const nconf = require("nconf");
const fs = require("fs");
const path = require("path");

const d2iData = fs.readFileSync(
  path.resolve(process.cwd(), path.join(nconf.get("dataPath"), "d2i", "i18n_fr.json")),
);
const data = {
  d2i: JSON.parse(d2iData),
};
const converters = {
  BI: "ui.criterion.unusableItem",
  CM: "ui.stats.movementPoints",
  CP: "ui.stats.actionPoints",
  CH: "ui.pvp.honourPoints",
  CD: "ui.pvp.disgracePoints",
  CT: "ui.stats.takleBlock",
  Ct: "ui.stats.takleEvade",
  Ca: "ui.stats.agility",
  CA: "ui.stats.agility",
  Cc: "ui.stats.chance",
  CC: "ui.stats.chance",
  Ce: "Energie",
  CE: "Energie",
  Ci: "ui.stats.intelligence",
  CI: "ui.stats.intelligence",
  CL: "ui.stats.lifePoints",
  Cs: "ui.stats.strength",
  CS: "ui.stats.strength",
  Cv: "ui.stats.vitality",
  CV: "ui.stats.vitality",
  Cw: "ui.stats.wisdom",
  CW: "ui.stats.wisdom",
  Oa: "ui.achievement.successPointsText",
  OA: sign => {
    if (sign === "=") return "ui.tooltip.unlockAchievement";
    return "ui.tooltip.dontUnlockAchievement";
  },
  Of: sign => {
    if (sign === "=") return "ui.tooltip.mountEquipedFamily";
    return "ui.tooltip.mountNonEquipedFamily";
  },
  Os: sign => {
    if (sign === "!") return "ui.tooltip.dontPossessSmileyPack";
    return "ui.tooltip.possessSmileyPack";
  },
  Ow: "ui.criterion.hasAlliance",
  OV: "ui.social.daysSinceLastConnection",
  Oc: "",
  Ox: "ui.criterion.allianceRights",
  Pa: "ui.tooltip.AlignmentLevel",
  PA: "",
  Pb: "",
  PB: sign => {
    if (sign === "=") return "ui.tooltip.beInSubarea";
    return "ui.tooltip.dontBeInSubarea";
  },
  Pe: "",
  PE: sign => {
    if (sign === "!") return "ui.tooltip.dontpossessEmote";
    return "ui.tooltip.possessEmote";
  },
  Pf: sign => {
    if (sign === "=") return "ui.tooltip.mountEquiped";
    return "ui.tooltip.mountNonEquiped";
  },
  Pg: "ui.pvp.giftRequired",
  PG: sign => {
    if (sign === "=") return "ui.tooltip.beABreed";
    return "ui.tooltip.dontBeABreed";
  },
  Pi: "",
  PI: "",
  Pj: "ui.common.short.level",
  PJ: "ui.common.short.level",
  Pk: "ui.criterion.setBonus",
  PK: "ui.common.kamas",
  PL: "ui.common.level",
  Pl: "ui.common.prestige",
  PN: "ui.common.name",
  PO: sign => {
    if (sign === "!") return "ui.common.doNotPossess";
    return "ui.common.doPossess";
  },
  Po: sign => {
    if (sign === "=") return "ui.tooltip.beInArea";
    return "ui.tooltip.dontBeInArea";
  },
  Pp: "ui.pvp.rank",
  PP: "ui.pvp.rank",
  Pr: "ui.alignment.spécialization",
  PR: "ui.tooltip.beSingle",
  Ps: "ui.common.alignment",
  PS: (sign, value) => {
    if (value === 1) return "ui.tooltip.beFemale";
    return "ui.tooltip.beMale";
  },
  PT: sign => {
    if (sign === "=") return "ui.criterion.gotSpell";
    return "ui.criterion.doesntGotSpell";
  },
  Pw: sign => {
    if (sign === "=") return "ui.criterion.hasGuild";
    return "ui.criterion.noGuild";
  },
  Px: sign => {
    if (sign === "=") return "ui.criterion.guildRights";
    return "ui.criterion.notGuildRights";
  },
  PX: "ui.social.guildHouseRights",
  Pz: "",
  Py: "ui.guild.guildLevel",
  PZ: sign => {
    if (sign === "=") return "ui.tooltip.beSubscirber";
    return "ui.tooltip.dontBeSubscriber";
  },
  Qa: "ui.grimoire.quest.active",
  Qc: "ui.grimoire.quest.startable",
  Qf: "ui.grimoire.quest.done",
  MK: "ui.criterion.MK",
  Sc: "",
  SG: "ui.time.months",
  Sd: "ui.time.days",
  SI: "ui.header.server",
  Sy: sign => {
    if (sign === "=") return "ui.criterion.community";
    return "ui.criterion.notCommunity";
  },
};

const staticConverters = {
  ca: "Agilité additionnelle",
  cc: "Chance additionnelle",
  ci: "Intelligence additionnelle",
  cs: "Force additionnelle",
  cv: "Vitalité additionnelle",
  cw: "Sagesse additionnelle",
};

class CriterionConverter {
  static ConvertCriterion(criterion) {}
}

module.exports = CriterionConverter;
