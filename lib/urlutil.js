export function makeAbsolute(url) {
  var anchorEl = document.createElement('a');
  anchorEl.href = url;
  return anchorEl.href;
};
