"use strict";

const EffectInstance = require("./EffectInstance");

const pad = (originalVal, originalLen) => {
  let val = String(originalVal);
  const len = originalLen || 2;
  while (val.length < len) {
    val = `0${val}`;
  }
  return val;
};

const types = {
  70: effect => new EffectInstance(effect.value),
  71: effect => new EffectInstance(effect.monsterFamilyId),
  72: effect => {
    const month = effect.month + 1;
    const { day, hour, minute } = effect;
    return new EffectInstance(
      effect.year,
      `${pad(month)}${pad(day)}`,
      `${pad(hour)}${pad(minute)}`,
      month,
      day,
    );
  },
  73: effect => new EffectInstance(effect.diceNum, effect.diceSide, effect.diceConst),
  74: effect => new EffectInstance(null, null, null, effect.value),
  75: effect => new EffectInstance(effect.days, effect.hours, effect.minutes),
  81: effect => new EffectInstance(effect.monsterFamilyId, effect.monsterCount),
  82: effect => new EffectInstance(effect.min, effect.max === 0 ? null : effect.max),
  179: effect => new EffectInstance(effect.date, effect.modelId, effect.mountId),
};

module.exports = ({ typeId, ...rest }) => {
  console.log(typeId, rest);
  return types[typeId](rest);
};
