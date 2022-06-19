/*
  Used to support lucafabbian's firepad.
*/

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      type: "javascript/auto",
    },
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ];
  return config;
};
