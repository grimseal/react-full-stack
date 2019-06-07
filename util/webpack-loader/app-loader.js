module.exports = function(source) {
  // const removeImport = /^((?!client)[\s\S])*$/g;
  const removeImport = /^import.*react-hot-loader\/root.*$/gm;
  const removeHot = /hot\(([^)]+)\)/gm;
  return source.replace(removeImport, '').replace(removeHot, '$1');
};

