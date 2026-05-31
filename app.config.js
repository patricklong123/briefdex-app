// Layers on top of app.json to inject the RevenueCat API key from the
// environment. EAS Build resolves `process.env.REVENUECAT_API_KEY` from the
// project's EAS env vars; local `expo start` resolves it from `.env` (which is
// gitignored).
//
// Everything else lives in app.json — this file only adds to `extra`.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  },
});
