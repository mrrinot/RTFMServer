"use strict";

const indexOf = (arr, arg) => arr.indexOf(arg);
const isNaN = val => Number.isNaN(val);

class PatternDecoder {
  static getDescription(descriptionString, args) {
    const descriptionArr = descriptionString.split("");
    const decodedDescription = PatternDecoder.decodeDescription(descriptionArr, args).join("");
    return decodedDescription;
  }

  static findOptionalDices(descriptionArr, args) {
    let beforeLeftBrace = [];
    let afterRightBrace = [];
    let loc5 = descriptionArr;
    const leftBracePos = indexOf(descriptionArr, "{");
    const rightBracePos = indexOf(descriptionArr, "}");
    if (leftBracePos >= 0 && rightBracePos > leftBracePos) {
      let afterRightBraceIndex = 0;
      let beforeLeftBraceIndex = 0;
      while (descriptionArr[leftBracePos - (beforeLeftBraceIndex + 1)] === " ") {
        beforeLeftBraceIndex += 1;
      }
      afterRightBraceIndex = 0;
      while (descriptionArr[rightBracePos + (afterRightBraceIndex + 1)] === " ") {
        afterRightBraceIndex += 1;
      }
      beforeLeftBrace = descriptionArr.slice(0, leftBracePos - (2 + beforeLeftBraceIndex));
      afterRightBrace = descriptionArr.slice(
        rightBracePos - leftBracePos + 5 + afterRightBraceIndex + beforeLeftBraceIndex,
        descriptionArr.length - (rightBracePos - leftBracePos),
      );
      if (descriptionArr[0] === "#" && descriptionArr[descriptionArr.length - 2] === "#") {
        if (args[1] === null && args[2] === null && args[3] === null) {
          beforeLeftBrace.push(args[0]);
        } else if (args[0] === 0 && args[1] === 0) {
          beforeLeftBrace.push(args[2]);
        } else if (!args[2]) {
          descriptionArr.splice(descriptionArr.indexOf("#"), 2, args[0]);
          descriptionArr.splice(descriptionArr.indexOf("{"), 1);
          descriptionArr.splice(descriptionArr.indexOf("~"), 4);
          descriptionArr.splice(descriptionArr.indexOf("#"), 2, args[1]);
          descriptionArr.splice(descriptionArr.indexOf("}"), 1);
          beforeLeftBrace = beforeLeftBrace.concat(descriptionArr);
        } else {
          descriptionArr.splice(descriptionArr.indexOf("#"), 2, args[0] + args[2]);
          descriptionArr.splice(descriptionArr.indexOf("{"), 1);
          descriptionArr.splice(descriptionArr.indexOf("~"), 4);
          descriptionArr.splice(descriptionArr.indexOf("#"), 2, args[0] * args[1] + args[2]);
          descriptionArr.splice(descriptionArr.indexOf("}"), 1);
          beforeLeftBrace = beforeLeftBrace.concat(descriptionArr);
        }
        loc5 = beforeLeftBrace.concat(afterRightBrace);
      }
    }
    return loc5;
  }

  static decodeDescription(descriptionArr, args) {
    let loc3 = NaN;
    let loc6 = NaN;
    let loc7 = NaN;
    let loc8 = NaN;
    let loc9 = null;
    let loc10 = NaN;
    let loc11 = NaN;
    loc3 = 0;
    let loc4 = "";
    const loc5 = descriptionArr.length;
    descriptionArr = PatternDecoder.findOptionalDices(descriptionArr, args); // eslint-disable-line no-param-reassign
    while (loc3 < loc5) {
      loc4 = descriptionArr[loc3];
      switch (loc4) { // eslint-disable-line default-case
        case "#":
          loc6 = descriptionArr[loc3 + 1];
          if (!isNaN(loc6)) {
            if (args[loc6 - 1] !== undefined) {
              descriptionArr.splice(loc3, 2, args[loc6 - 1]);
              loc3 -= 1;
            } else {
              descriptionArr.splice(loc3, 2);
              loc3 -= 2;
            }
          }
          break;
        case "~":
          loc7 = descriptionArr[loc3 + 1];
          if (!isNaN(loc7)) {
            if (args[loc7 - 1] !== null) {
              descriptionArr.splice(loc3, 2);
              loc3 -= 2;
            } else {
              return descriptionArr.slice(0, loc3);
            }
          }
          break;
        case "{":
          loc8 = indexOf(descriptionArr.slice(loc3), "}");
          loc9 = PatternDecoder.decodeDescription(
            descriptionArr.slice(loc3 + 1, loc3 + loc8),
            args,
          ).join("");
          descriptionArr.splice(loc3, loc8 + 1, loc9);
          break;
        case "[":
          loc10 = indexOf(descriptionArr.slice(loc3), "]");
          loc11 = Number(descriptionArr.slice(loc3 + 1, loc3 + loc10).join(""));
          if (!isNaN(loc11)) {
            descriptionArr.splice(loc3, loc10 + 1, `${args[loc11]} `);
            loc3 -= loc10;
          }
      }
      loc3 += 1;
    }
    return descriptionArr;
  }
}

module.exports = PatternDecoder;
