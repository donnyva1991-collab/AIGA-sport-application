module.exports = {
  logError(error) {
    console.error(`[${new Date().toISOString()}]`, error);
  }
};
