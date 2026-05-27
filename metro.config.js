const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 53 enables Metro's package-exports resolution by default, which routes
// @supabase/supabase-js through its ESM build. That build uses dynamic
// `import(/* magic comments */ VAR)` which Hermes' parser rejects with
// "Invalid expression encountered". Falling back to the legacy resolver picks
// the CJS build that uses `require()` instead.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
