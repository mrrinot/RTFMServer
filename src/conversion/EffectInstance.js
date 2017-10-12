"use strict";

const PatternDecoder = require("./PatternDecoder");

class EffectInstance {
  get parameter0() {
    return 1111;
  }

  get parameter1() {
    return 2222;
  }

  get parameter2() {
    return 3333;
  }

  get parameter3() {
    return 4444;
  }

  get parameter4() {
    return 5555;
  }

  prepareDescription(descriptionStr, effectId) {
    if (!descriptionStr) {
      return `__NOT_DECODED__ (${effectId})`;
    }
    let paramArray = [];
    let resultStr = "";
    if (descriptionStr.indexOf("#") !== -1) {
      paramArray = [
        `${this.parameter0}`,
        `${this.parameter1}`,
        `${this.parameter2}`,
        `${this.parameter3}`,
        `${this.parameter4}`,
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
      switch (effectId) { // eslint-disable-line default-case
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
        case 1175:
          paramArray[0] = `{spellNoLvl,${paramArray[0]},${paramArray[1]}}`;
          break;
        case 800:
          paramArray[2] = paramArray[0];
          break;
        case 806:
          if (paramArray[1] > 6) {
            paramArray[0] = `Obèse (+${paramArray[1]} repas)`;
          } else if (paramArray[2] > 6) {
            paramArray[0] = `Maigrichon (-${paramArray[2]} repas)`;
          } else if (this instanceof EffectInstanceInteger && paramArray[0] > 6) {
            paramArray[0] = `Maigrichon (-${paramArray[0]} repas)`;
          } else {
            paramArray[0] = "Normal";
          }
          break;
        case 961:
        case 962:
          paramArray[2] = paramArray[0];
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
        case 805:
        case 808:
        case 983: {
          if (paramArray[0] === undefined && paramArray[1] === undefined && paramArray[2] > 0) {
            paramArray[0] = paramArray[2];
            break;
          }
          if (paramArray[0] === null && paramArray[1] === null && paramArray[2] === null) {
            break;
          }
          paramArray[2] = paramArray[2] === undefined ? 0 : paramArray[2];
          const year = paramArray[0];
          const month = paramArray[1].substr(0, 2);
          const day = paramArray[1].substr(2, 2);
          const hour = paramArray[2].substr(0, 2);
          const minute = paramArray[2].substr(2, 2);
          paramArray[0] = `${day}/${month}/${year} ${hour}:${minute}`;
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

module.exports = EffectInstance;

console.log(new EffectInstance().prepareDescription(undefined, 984));
