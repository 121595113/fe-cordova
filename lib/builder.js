// 待优化
import utils from './utils';

function each(objects, func, context) {
  for (var prop in objects) {
    if (objects.hasOwnProperty(prop)) {
      func.apply(context, [objects[prop], prop]);
    }
  }
}

function clobber(obj, key, value) {
  exports.replaceHookForTesting(obj, key);
  var needsProperty = false;
  try {
    obj[key] = value;
  } catch (e) {
    needsProperty = true;
  }
  // Getters can only be overridden by getters.
  if (needsProperty || obj[key] !== value) {
    utils.defineGetter(obj, key, function () {
      return value;
    });
  }
}

function assignOrWrapInDeprecateGetter(obj, key, value, message) {
  if (message) {
    utils.defineGetter(obj, key, function () {
      console.log(message);
      delete obj[key];
      clobber(obj, key, value);
      return value;
    });
  } else {
    clobber(obj, key, value);
  }
}

function include(parent, objects, clobber, merge) {
  each(objects, function (obj, key) {
    try {
      var result = obj.path ? require(obj.path) : {};

      if (clobber) {
        // Clobber if it doesn't exist.
        if (typeof parent[key] === 'undefined') {
          assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
        } else if (typeof obj.path !== 'undefined') {
          // If merging, merge properties onto parent, otherwise, clobber.
          if (merge) {
            recursiveMerge(parent[key], result);
          } else {
            assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
          }
        }
        result = parent[key];
      } else {
        // Overwrite if not currently defined.
        if (typeof parent[key] == 'undefined') {
          assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
        } else {
          // Set result to what already exists, so we can build children into it if they exist.
          result = parent[key];
        }
      }

      if (obj.children) {
        include(result, obj.children, clobber, merge);
      }
    } catch (e) {
      utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
    }
  });
}

/**
 * Merge properties from one object onto another recursively.  Properties from
 * the src object will overwrite existing target property.
 *
 * @param target Object to merge properties into.
 * @param src Object to merge properties from.
 */
function recursiveMerge(target, src) {
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      if (target.prototype && target.prototype.constructor === target) {
        // If the target object is a constructor override off prototype.
        clobber(target.prototype, prop, src[prop]);
      } else {
        if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
          recursiveMerge(target[prop], src[prop]);
        } else {
          clobber(target, prop, src[prop]);
        }
      }
    }
  }
}

export default {
  buildIntoButDoNotClobber: (objects, target) => {
    include(target, objects, false, false);
  },
  buildIntoAndClobber: (objects, target) => {
    include(target, objects, true, false);
  },
  buildIntoAndMerge: (objects, target) => {
    include(target, objects, true, true);
  },
  recursiveMerge,
  assignOrWrapInDeprecateGetter,
  replaceHookForTesting: () => {}
}
