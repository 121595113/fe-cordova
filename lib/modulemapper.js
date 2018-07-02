import builder from './builder';
import {require, define} from './cmd';

var moduleMap = define.moduleMap,
  symbolList,
  deprecationMap;

export function reset() {
  symbolList = [];
  deprecationMap = {};
};

function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
  if (!(moduleName in moduleMap)) {
    throw new Error('Module ' + moduleName + ' does not exist.');
  }
  symbolList.push(strategy, moduleName, symbolPath);
  if (opt_deprecationMessage) {
    deprecationMap[symbolPath] = opt_deprecationMessage;
  }
}

// Note: Android 2.3 does have Function.bind().
export function clobbers(moduleName, symbolPath, opt_deprecationMessage) {
  addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
};

export function merges(moduleName, symbolPath, opt_deprecationMessage) {
  addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
};

export function defaults(moduleName, symbolPath, opt_deprecationMessage) {
  addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
};

export function runs(moduleName) {
  addEntry('r', moduleName, null);
};

function prepareNamespace(symbolPath, context) {
  if (!symbolPath) {
    return context;
  }
  var parts = symbolPath.split('.');
  var cur = context;
  for (var i = 0, part; part = parts[i]; ++i) {
    cur = cur[part] = cur[part] || {};
  }
  return cur;
}

export function mapModules(context) {
  var origSymbols = {};
  context.CDV_origSymbols = origSymbols;
  for (var i = 0, len = symbolList.length; i < len; i += 3) {
    var strategy = symbolList[i];
    var moduleName = symbolList[i + 1];
    var module = require(moduleName);
    // <runs/>
    if (strategy == 'r') {
      continue;
    }
    var symbolPath = symbolList[i + 2];
    var lastDot = symbolPath.lastIndexOf('.');
    var namespace = symbolPath.substr(0, lastDot);
    var lastName = symbolPath.substr(lastDot + 1);

    var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
    var parentObj = prepareNamespace(namespace, context);
    var target = parentObj[lastName];

    if (strategy == 'm' && target) {
      builder.recursiveMerge(target, module);
    } else if ((strategy == 'd' && !target) || (strategy != 'd')) {
      if (!(symbolPath in origSymbols)) {
        origSymbols[symbolPath] = target;
      }
      builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
    }
  }
};

export function getOriginalSymbol(context, symbolPath) {
  var origSymbols = context.CDV_origSymbols;
  if (origSymbols && (symbolPath in origSymbols)) {
    return origSymbols[symbolPath];
  }
  var parts = symbolPath.split('.');
  var obj = context;
  for (var i = 0; i < parts.length; ++i) {
    obj = obj && obj[parts[i]];
  }
  return obj;
};

reset();
