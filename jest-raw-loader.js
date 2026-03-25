// Custom transformer for raw files (html, txt, subject) compatible with Jest 29
module.exports = {
  process(sourceText) {
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`
    };
  }
};
