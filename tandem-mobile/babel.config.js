module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@app": "./src/app",
            "@features": "./src/features",
            "@shared": "./src/shared",
            "@core": "./src/core",
            "@infrastructure": "./src/infrastructure",
            "@store": "./src/store",
          },
        },
      ],
      // react-native-reanimated/plugin MUST be listed last
      "react-native-reanimated/plugin",
    ],
  };
};

