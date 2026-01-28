const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Write generated CSS outside node_modules/.cache so Metro can hash/watch it.
  outputDir: ".nativewind",
});
