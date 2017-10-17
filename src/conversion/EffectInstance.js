"use strict";

const _ = require("lodash");
const PatternDecoder = require("./PatternDecoder");
const DataManager = require("./DataManager");
const I18n = require("./I18n");

class EffectInstance {
  constructor(p1 = null, p2 = null, p3 = null, p4 = null, p5 = null) {
    this.p1 = p1 || null;
    this.p2 = p2 || null;
    this.p3 = p3 || null;
    this.p4 = p4 || null;
    this.p5 = p5 || null;
  }

  get parameter0() {
    return this.p1;
  }

  get parameter1() {
    return this.p2;
  }

  get parameter2() {
    return this.p3;
  }

  get parameter3() {
    return this.p4;
  }

  get parameter4() {
    return this.p5;
  }

  getEmoticonName(param1) {
    const { Emoticons } = DataManager;
    const emoticon = _.find(Emoticons, ["id", param1]);
    return emoticon ? emoticon.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getItemTypeName(param1) {
    const { ItemTypes } = DataManager;
    const itemType = _.find(ItemTypes, ["id", param1]);
    return itemType ? itemType.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getMonsterName(param1) {
    const { Monsters } = DataManager;
    const monster = _.find(Monsters, ["id", param1]);
    return monster ? monster.nameId_string : I18n.getUiText("ui.effect.unknownMonster");
  }

  getCompanionName(id) {
    const { Companions } = DataManager;
    const companion = _.find(Companions, ["id", id]);
    return companion ? companion.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getMonsterGrade(id, grade) {
    const { Monsters } = DataManager;
    const monster = _.find(Monsters, ["id", id]);
    return monster ? monster.grades[grade - 1].level.toString() : EffectInstance.UNKNOWN_NAME;
  }

  getSpellName(id) {
    const { Spells } = DataManager;
    const spell = _.find(Spells, ["id", id]);
    return spell ? spell.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getSpellLevelName(spellLvlId) {
    const { SpellLevels } = DataManager;
    const spellLevel = _.find(SpellLevels, ["id", spellLvlId]);
    const spellName = spellLevel
      ? this.getSpellName(spellLevel.spellId)
      : EffectInstance.UNKNOWN_NAME;
    return spellName;
  }

  getJobName(jobId) {
    const { Jobs } = DataManager;
    const job = _.find(Jobs, ["id", jobId]);
    return job ? job.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getDocumentTitle(param1) {
    const { Documents } = DataManager;
    const document = _.find(Documents, ["id", param1]);
    return document ? document.title : EffectInstance.UNKNOWN_NAME;
  }

  getAlignmentSideName(param1) {
    const { AlignmentSides } = DataManager;
    const alignmentSide = _.find(AlignmentSides, ["id", param1]);
    return alignmentSide ? alignmentSide.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getItemName(param1) {
    const { Items } = DataManager;
    const item = _.find(Items, ["id", param1]);
    return item ? item.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getMonsterSuperRaceName(param1) {
    const { MonsterSuperRaces } = DataManager;
    const monsterSuperRace = _.find(MonsterSuperRaces, ["id", param1]);
    return monsterSuperRace ? monsterSuperRace.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getMonsterRaceName(param1) {
    const { MonsterRaces } = DataManager;
    const monsterRace = _.find(MonsterRaces, ["id", param1]);
    return monsterRace ? monsterRace.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getTitleName(param1) {
    const { Titles } = DataManager;
    const title = _.find(Titles, ["id", param1]);
    return title ? title.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  getMountFamilyName(param1) {
    const { MountFamilys } = DataManager;
    const mountFamily = _.find(MountFamilys, ["id", param1]);
    return mountFamily ? mountFamily.nameId_string : EffectInstance.UNKNOWN_NAME;
  }

  prepareDescription(descriptionStr, effectId) {
    if (!descriptionStr) {
      return null;
    }
    let paramArray = [];
    let resultStr = "";
    if (descriptionStr.indexOf("#") !== -1) {
      paramArray = [
        this.parameter0,
        this.parameter1,
        this.parameter2,
        this.parameter3,
        this.parameter4,
      ];
      if (this.parameter0 > 0 && this.parameter1 > 0 && this.bonusType === -1) {
        paramArray = [
          this.parameter1,
          this.parameter0,
          this.parameter2,
          this.parameter3,
          this.parameter4,
        ];
      }
      switch (effectId) { // eslint-disable-line
        case 406:
          paramArray[1] = this.getSpellName(paramArray[2]);
          break;
        case 10:
          paramArray[2] = this.getEmoticonName(paramArray[0]);
          break;
        case 165:
        case 1084:
        case 1179:
          paramArray[0] = this.getItemTypeName(paramArray[0]);
          break;
        case 197:
        case 181:
        case 185:
        case 405:
        case 2796:
          paramArray[0] = this.getMonsterName(paramArray[0]);
          break;
        case 220:
          if (!paramArray[0] && !paramArray[1] && paramArray[2]) {
            paramArray[0] = paramArray[2];
          }
          break;
        case 812:
          if (paramArray[2] && paramArray[1] === null) {
            paramArray[1] = 0;
          }
          break;
        case 281:
        case 282:
        case 283:
        case 284:
        case 285:
        case 286:
        case 287:
        case 288:
        case 289:
        case 290:
        case 291:
        case 292:
        case 293:
        case 294:
        case 1160:
          paramArray[0] = this.getSpellName(paramArray[0]);
          break;
        case 1175:
          paramArray[0] = `{spellNoLvl,${paramArray[0]},${paramArray[1]}}`;
          break;
        case 604:
          if (paramArray[2] === null) {
            paramArray[2] = paramArray[0];
          }
          paramArray[2] = this.getSpellLevelName(paramArray[2]);
          break;
        case 614:
        case 1050:
          paramArray[0] = paramArray[2];
          paramArray[1] = this.getJobName(paramArray[1]);
          break;
        case 616:
        case 624:
          paramArray[2] = this.getSpellName(paramArray[0]);
          break;
        case 620:
          paramArray[2] = this.getDocumentTitle(paramArray[0]);
          break;
        case 621:
          paramArray[2] = this.getMonsterName(paramArray[1]);
          break;
        case 623:
        case 628:
          paramArray[1] = this.getMonsterGrade(paramArray[2], paramArray[0]);
          paramArray[2] = this.getMonsterName(paramArray[2]);
          break;
        case 649:
        case 960:
          paramArray[2] = this.getAlignmentSideName(paramArray[0]);
          break;
        case 669:
          break;
        case 699:
          paramArray[0] = this.getJobName(paramArray[0]);
          break;
        case 706:
          break;
        case 715:
          paramArray[0] = this.getMonsterSuperRaceName(paramArray[0]);
          break;
        case 716:
          paramArray[0] = this.getMonsterRaceName(paramArray[0]);
          break;
        case 717:
        case 1008:
        case 1011:
          paramArray[0] = this.getMonsterName(paramArray[0]);
          break;
        case 724:
          paramArray[2] = this.getTitleName(paramArray[0]);
          break;
        case 787:
        case 792:
        case 793:
        case 1017:
        case 1018:
        case 1019:
        case 1035:
        case 1036:
        case 1044:
        case 1045:
        case 2794:
          paramArray[0] = this.getSpellName(paramArray[0]);
          break;
        case 800:
          paramArray[2] = paramArray[0];
          break;
        case 806:
          if (paramArray[1] > 6) {
            paramArray[0] = I18n.getUiText("ui.petWeight.fat", [paramArray[1]]);
          } else if (paramArray[2] > 6) {
            paramArray[0] = I18n.getUiText("ui.petWeight.lean", [paramArray[2]]);
          } else if (paramArray[0] > 6) {
            paramArray[0] = I18n.getUiText("ui.petWeight.lean", [paramArray[0]]);
          } else {
            paramArray[0] = I18n.getUiText("ui.petWeight.nominal");
          }
          break;
        case 807:
          if (paramArray[0]) {
            paramArray[0] = this.getItemName(paramArray[0]);
          } else {
            paramArray[0] = I18n.getUiText("ui.common.none");
          }
          break;
        case 814:
        case 1151:
        case 1176:
        case 1187:
          paramArray[0] = this.getItemName(paramArray[0]);
          break;
        case 1188:
          paramArray[0] = this.getMountFamilyName(paramArray[0]);
          break;
        case 905:
          paramArray[1] = this.getMonsterName(paramArray[1]);
          break;
        case 939:
        case 940:
          paramArray[2] = this.getItemName(paramArray[0]);
          break;
        case 950:
        case 951:
        case 952: {
          const { SpellStates } = DataManager;
          const loc9 =
            paramArray[2] !== null
              ? _.find(SpellStates, ["id", paramArray[2]])
              : _.find(SpellStates, ["id", paramArray[0]]);
          if (loc9) {
            if (loc9.isSilent) {
              return "";
            }
            paramArray[2] = loc9.nameId_string;
          } else {
            paramArray[2] = EffectInstance.UNKNOWN_NAME;
          }
          break;
        }
        case 961:
        case 962:
          paramArray[2] = paramArray[0];
          break;
        case 982:
          break;
        case 988:
        case 987:
        case 985:
        case 996:
          paramArray[3] = `{player,${paramArray[3]}}`;
          break;
        case 1111:
          paramArray[2] = paramArray[0];
          break;
        case 1161:
          paramArray[0] = this.getCompanionName(paramArray[0]);
          break;
        case 805:
        case 808:
        case 983: {
          if (!paramArray[0] && !paramArray[1] && paramArray[2] > 0) {
            paramArray[0] = paramArray[2];
            break;
          }
          if (!paramArray[0] && !paramArray[1] && !paramArray[2]) {
            break;
          }
          paramArray[2] = paramArray[2] || 0;
          const year = `${paramArray[0]}`;
          const month = `${paramArray[1]}`.substr(0, 2);
          const day = `${paramArray[1]}`.substr(2, 2);
          const hour = `${paramArray[2]}`.substr(0, 2);
          const minutes = `${paramArray[2]}`.substr(2, 2);
          paramArray[0] = `${day}/${month}/${year} ${hour}:${minutes}`;
          break;
        }
      }
      resultStr = PatternDecoder.getDescription(descriptionStr, paramArray);
      if (!resultStr) {
        return `__NOT_DECODED__ (${effectId})`;
      }
    } else {
      resultStr = descriptionStr;
    }
    return resultStr;
  }
}

EffectInstance.UNKNOWN_NAME = "???";

module.exports = EffectInstance;
