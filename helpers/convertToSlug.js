const unicode = require("unidecode");

module.exports.convertToSlug = (text) => {

  const unicodeText = unicode(text);

  const slug = unicodeText
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .toLowerCase();

  return slug;
}