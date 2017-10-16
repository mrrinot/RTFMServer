"use strict";

const I18n = require("./I18n");
const DataManager = require("./DataManager");
const PatternDecoder = require("./PatternDecoder");
const _ = require("lodash");

const UNKNOWN_NAME = "???";

function getNameById(d2oFile, fieldName, id) {
  const val = _.find(DataManager[d2oFile], ["id", parseInt(id, 10)]);
  return val ? val[fieldName] : UNKNOWN_NAME;
}

function getI18TextDecoded(i18text, values = []) {
  return PatternDecoder.getDescription(I18n.getUiText(i18text, values), values);
}

function additionalStat(critName, sign, value) {
  return `${getI18TextDecoded(critName)} additionnelle ${sign} ${value}`; // Force additionnelle > 58
}

function simpleCriteria(critName, sign, value) {
  return `${getI18TextDecoded(critName)} ${sign} ${value}`; // Temps d'abonnements = 1020
}

function fileCriteriaWithSign(critName, sign, value, file, fieldName = "nameId_string") {
  return `${getI18TextDecoded(critName)} ${sign} ${getNameById(file, fieldName, value)}`; // Serveur = id:1001 => Shika
}

function fileCriteriaExternValue(critName, value, file, fieldName = "nameId_string") {
  return `${I18n.getUiText(critName)} ${getNameById(file, fieldName, value)}`;
}

function fileCriteria(critName, value, file, fieldName = "nameId_string") {
  return `${getI18TextDecoded(critName, [getNameById(file, fieldName, value)])}`; // Avoir fini le succès id:57 => Chateau du Wa Wabbit
}

const converters = {
  BI: (sign, value) => simpleCriteria("ui.criterion.unusableItem", sign, value),
  CM: (sign, value) => simpleCriteria("ui.stats.movementPoints", sign, value),
  CP: (sign, value) => simpleCriteria("ui.stats.actionPoints", sign, value),
  CH: (sign, value) => simpleCriteria("ui.pvp.honourPoints", sign, value),
  CD: (sign, value) => simpleCriteria("ui.pvp.disgracePoints", sign, value),
  CT: (sign, value) => simpleCriteria("ui.stats.takleBlock", sign, value),
  Ct: (sign, value) => simpleCriteria("ui.stats.takleEvade", sign, value),
  Ca: (sign, value) => simpleCriteria("ui.stats.agility", sign, value),
  CA: (sign, value) => simpleCriteria("ui.stats.agility", sign, value),
  Cc: (sign, value) => simpleCriteria("ui.stats.chance", sign, value),
  CC: (sign, value) => simpleCriteria("ui.stats.chance", sign, value),
  Ce: (sign, value) => `Energie ${sign} ${value}`,
  CE: (sign, value) => `Energie ${sign} ${value}`,
  Ci: (sign, value) => simpleCriteria("ui.stats.intelligence", sign, value),
  CI: (sign, value) => simpleCriteria("ui.stats.intelligence", sign, value),
  CL: (sign, value) => simpleCriteria("ui.stats.lifePoints", sign, value),
  Cs: (sign, value) => simpleCriteria("ui.stats.strength", sign, value),
  CS: (sign, value) => simpleCriteria("ui.stats.strength", sign, value),
  Cv: (sign, value) => simpleCriteria("ui.stats.vitality", sign, value),
  CV: (sign, value) => simpleCriteria("ui.stats.vitality", sign, value),
  Cw: (sign, value) => simpleCriteria("ui.stats.wisdom", sign, value),
  CW: (sign, value) => simpleCriteria("ui.stats.wisdom", sign, value),
  Oa: (sign, value) => simpleCriteria("ui.achievement.successPointsText", sign, value),
  OA: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.tooltip.unlockAchievement", value, "Achievements");
    return fileCriteria("ui.tooltip.dontUnlockAchievement", value, "Achievements");
  },
  Of: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.tooltip.mountEquipedFamily", value, "MountFamily");
    return fileCriteria("ui.tooltip.mountNonEquipedFamily", value, "MountFamily");
  },
  Os: (sign, value) => {
    if (sign === "!")
      return fileCriteriaExternValue("ui.tooltip.dontPossessSmileyPack", value, "SmileyPacks");
    return fileCriteriaExternValue("ui.tooltip.possessSmileyPack", value, "SmileyPacks");
  },
  Ow: (sign, value) => {
    if (value === "1") return I18n.getUiText("ui.criterion.hasAlliance");
    return I18n.getUiText("ui.criterion.noAlliance");
  },
  OV: (sign, value) =>
    `${I18n.getUiText(
      "ui.veteran.totalSubscriptionDuration",
    )} ${sign} ${getI18TextDecoded("ui.social.daysSinceLastConnection", [value])}`,
  Ox: (sign, value) => {
    let str = "";
    switch (parseInt(value, 10)) {
      case 1:
        str = I18n.getUiText("ui.guild.right.leader");
        break;
      case 16:
        str = I18n.getUiText("ui.social.guildRightsBann");
        break;
      case 2:
        str = I18n.getUiText("ui.social.guildRightsSetAlliancePrism");
        break;
      case 32:
        str = I18n.getUiText("ui.social.guildManageRights");
        break;
      case 8:
        str = I18n.getUiText("ui.social.guildRightsInvit");
        break;
      case 4:
        str = I18n.getUiText("ui.social.guildRightsTalkInAllianceChannel");
        break;
      default:
        str = "???";
    }
    return I18n.getUiText("ui.criterion.allianceRights", [str]);
  },
  Pa: (sign, value) => simpleCriteria("ui.tooltip.AlignmentLevel", sign, value),
  PB: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.tooltip.beInSubarea", value, "SubAreas");
    return fileCriteria("ui.tooltip.dontBeInSubarea", value, "SubAreas");
  },
  PE: (sign, value) => {
    if (sign === "!")
      return fileCriteriaExternValue("ui.tooltip.dontPossessEmote", value, "Emoticons");
    return fileCriteriaExternValue("ui.tooltip.possessEmote", value, "Emoticons");
  },
  Pf: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.tooltip.mountEquiped", value, "Mounts");
    return fileCriteria("ui.tooltip.mountNonEquiped", value, "Mounts");
  },
  Pg: (sign, value) => getI18TextDecoded("ui.pvp.giftRequired", [value]),
  PG: (sign, value) => {
    if (sign === "=")
      return fileCriteria("ui.tooltip.beABreed", value, "Breeds", "shortNameId_string");
    return fileCriteria("ui.tooltip.dontBeABreed", value, "Breeds", "shortNameId_string");
  },
  Pj: (sign, value) => fileCriteria("ui.common.short.level", value, "Jobs"),
  PJ: (sign, value) => {
    const vals = value.split(",");
    return `${getNameById("Jobs", "nameId_string", vals[0])} ${sign} ${I18n.getUiText(
      "ui.common.short.level",
    )}${vals[1]}`;
  },
  Pk: (sign, value) => simpleCriteria("ui.criterion.setBonus", sign, value),
  PK: (sign, value) => simpleCriteria("ui.common.kamas", sign, value),
  PL: (sign, value) => simpleCriteria("ui.common.level", sign, value),
  Pl: (sign, value) => simpleCriteria("ui.common.prestige", sign, value),
  PN: (sign, value) => `${I18n.getUiText("ui.common.name")} = ${value}`,
  PO: (sign, value) => {
    if (sign === "!") return fileCriteria("ui.common.doNotPossess", value, "Items");
    return fileCriteria("ui.common.doPossess", value, "Items");
  },
  Po: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.tooltip.beInArea", value, "Areas");
    return fileCriteria("ui.tooltip.dontBeInArea", value, "Areas");
  },
  Pp: (sign, value) => simpleCriteria("ui.pvp.rank", sign, value),
  PP: (sign, value) => simpleCriteria("ui.pvp.rank", sign, value),
  Pr: (sign, value) => simpleCriteria("ui.alignment.spécialization", sign, value),
  PR: (sign, value) => {
    if (sign === "=") {
      if (value === "1") return I18n.getUiText("ui.tooltip.beMaried");
      return I18n.getUiText("ui.tooltip.beSingle");
    }
    if (value === "2") return I18n.getUiText("ui.tooltip.beSingle");
    return I18n.getUiText("ui.tooltip.beMaried");
  },
  Ps: (sign, value) => fileCriteriaWithSign("ui.common.alignment", sign, value, "AlignmentSides"),
  PS: (sign, value) => {
    if (value === "1") return I18n.getUiText("ui.tooltip.beFemale");
    return I18n.getUiText("ui.tooltip.beMale");
  },
  PT: (sign, value) => {
    if (sign === "=") return fileCriteria("ui.criterion.gotSpell", value, "Spells");
    return fileCriteria("ui.criterion.doesntGotSpell", value, "Spells");
  },
  Pw: sign => {
    if (sign === "=") return I18n.getUiText("ui.criterion.hasGuild");
    return I18n.getUiText("ui.criterion.noGuild");
  },
  PW: (sign, value) => simpleCriteria("ui.common.weight", sign, value),
  Px: (sign, value) => {
    let str = "";

    switch (parseInt(value, 10)) {
      case 1:
        str = I18n.getUiText("ui.guild.right.leader");
        break;
      case 16:
        str = I18n.getUiText("ui.social.guildRightsBann");
        break;
      case 512:
        str = I18n.getUiText("ui.social.guildRightsCollect");
        break;
      case 65536:
        str = I18n.getUiText("ui.social.guildRightsCollectMy");
        break;
      case 32768:
        str = I18n.getUiText("ui.social.guildRightsPrioritizeMe");
        break;
      case 128:
        str = I18n.getUiText("ui.social.guildRightsHiretax");
        break;
      case 8:
        str = I18n.getUiText("ui.social.guildRightsInvit");
        break;
      case 2:
        str = I18n.getUiText("ui.social.guildRightsBoost");
        break;
      case 256:
        str = I18n.getUiText("ui.social.guildRightManageOwnXP");
        break;
      case 64:
        str = I18n.getUiText("ui.social.guildRightsRank");
        break;
      case 4:
        str = I18n.getUiText("ui.social.guildManageRights");
        break;
      case 32:
        str = I18n.getUiText("ui.social.guildRightsPercentXp");
        break;
      case 8192:
        str = I18n.getUiText("ui.social.guildRightsMountParkArrange");
        break;
      case 131072:
        str = I18n.getUiText("ui.social.guildRightsSetAlliancePrism");
        break;
      case 362144:
        str = I18n.getUiText("ui.social.guildRightsTalkInAllianceChannel");
        break;
      case 16384:
        str = I18n.getUiText("ui.social.guildRightsManageOtherMount");
        break;
      case 4096:
        str = I18n.getUiText("ui.social.guildRightsMountParkUse");
        break;
      default:
        str = "???";
    }
    if (sign === "=") return I18n.getUiText("ui.criterion.guildRights", [str]);
    return I18n.getUiText("ui.criterion.notGuildRights", [str]);
  },
  PX: (sign, value) => simpleCriteria("ui.social.guildHouseRights", sign, value),
  Py: (sign, value) => simpleCriteria("ui.guild.guildLevel", sign, value),
  PZ: sign => {
    if (sign === "=") return I18n.getUiText("ui.tooltip.beSubscirber");
    return I18n.getUiText("ui.tooltip.dontBeSubscirber");
  },
  Qa: (sign, value) => fileCriteria("ui.grimoire.quest.active", value, "Quests"),
  Qc: (sign, value) => fileCriteria("ui.grimoire.quest.startable", value, "Quests"),
  Qf: (sign, value) => fileCriteria("ui.grimoire.quest.done", value, "Quests"),
  MK: (sign, value) => simpleCriteria("ui.criterion.MK", sign, value),
  SG: (sign, value) => simpleCriteria("ui.time.months", sign, value),
  Sd: (sign, value) => simpleCriteria("ui.time.days", sign, value),
  SI: (sign, value) => fileCriteriaWithSign("ui.header.server", sign, value, "Servers"),
  Sy: (sign, value) => {
    if (sign === "=") return simpleCriteria("ui.criterion.community", [value]);
    return simpleCriteria("ui.criterion.notCommunity", [value]);
  },
  ca: (sign, value) => additionalStat("ui.stats.agility", sign, value),
  cc: (sign, value) => additionalStat("ui.stats.chance", sign, value),
  ci: (sign, value) => additionalStat("ui.stats.intelligence", sign, value),
  cs: (sign, value) => additionalStat("ui.stats.strength", sign, value),
  cv: (sign, value) => additionalStat("ui.stats.vitality", sign, value),
  cw: (sign, value) => additionalStat("ui.stats.wisdom", sign, value),
};

function extractCriteria(criterion, pos) {
  let str = "";
  let i = pos;
  const criteria = criterion.substr(i, 2);
  i += 2;
  const sign = criterion[i];
  i++;
  let val = "";
  while (
    criterion[i] !== "&" &&
    criterion[i] !== "|" &&
    criterion[i] !== "(" &&
    criterion[i] !== ")" &&
    i < criterion.length
  ) {
    val += criterion[i];
    i++;
  }
  if (_.has(converters, criteria)) {
    str = converters[criteria](sign, val);
  }
  return [str, i];
}

class CriterionConverter {
  static ConvertCriterion(criterion) {
    if (criterion === null || criterion === undefined || criterion.length === 0) return "";
    let finalStr = "";
    let i = 0;
    let lastVal = "";
    let firstVal = true;
    while (i < criterion.length) {
      if (criterion[i] === "(" || criterion[i] === ")") {
        finalStr += criterion[i];
        i++;
      } else if (criterion[i] === "&") {
        if (!firstVal && lastVal !== "") finalStr += " ET ";
        i++;
      } else if (criterion[i] === "|") {
        if (!firstVal && lastVal !== "") finalStr += " OU ";
        i++;
      } else {
        const ret = extractCriteria(criterion, i);
        lastVal = ret[0];
        if (ret[0] !== "") {
          firstVal = false;
          finalStr += ret[0];
        }
        i = ret[1];
      }
    }
    return finalStr
      .replace("()", "")
      .replace("()", "")
      .replace("()", "")
      .replace(/ ET $/g, "")
      .replace(/ OU $/g, "");
  }
}

CriterionConverter.UNKNOWN_NAME = "???";

module.exports = CriterionConverter;
