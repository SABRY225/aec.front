export const mergeTranslations = (...modules) =>
  modules.reduce((acc, mod) => {
    const source = mod?.default ?? mod;
    return deepMerge(acc, source);
  }, {});

const deepMerge = (target, source) => {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
};
