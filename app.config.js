module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    // Only the Pages command sets this; local development stays at the root.
    baseUrl: process.env.PAGES_BASE_URL ?? '',
  },
});
