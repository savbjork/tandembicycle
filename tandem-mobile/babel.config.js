module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
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
    ],
  };
};

