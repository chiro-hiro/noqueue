module.exports = function customMappingFunction(explicit, implicit, path, reflection, context) {
  let tmpPath = path.split('/').slice(-2);
  let last = tmpPath[tmpPath.length - 1].replace(/\.ts/gi, '');
  if (['parallel-loop', 'queue-loop'].includes(last)) {
    return 'Infinity Loop';
  }
  if (['utilities'].includes(last)) {
    return 'Utilities';
  }
  return 'Common';
};
