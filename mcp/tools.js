/**
 * Deeply compares two values and returns a list of differences.
 * Inspired by shadow-runner's diff engine.
 */
function deepDiff(oldVal, newVal, path = '$') {
  if (Object.is(oldVal, newVal)) {
    return [];
  }

  if (oldVal == null || newVal == null) {
    return [{ path, oldValue: oldVal, newValue: newVal }];
  }

  if (typeof oldVal !== typeof newVal) {
    return [{ path, oldValue: oldVal, newValue: newVal }];
  }

  if (typeof oldVal !== 'object') {
    return [{ path, oldValue: oldVal, newValue: newVal }];
  }

  // Date comparison
  if (oldVal instanceof Date && newVal instanceof Date) {
    return oldVal.getTime() === newVal.getTime()
      ? []
      : [{ path, oldValue: oldVal, newValue: newVal }];
  }

  // RegExp comparison
  if (oldVal instanceof RegExp && newVal instanceof RegExp) {
    return oldVal.toString() === newVal.toString()
      ? []
      : [{ path, oldValue: oldVal, newValue: newVal }];
  }

  // Array comparison
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    const diffs = [];
    const maxLen = Math.max(oldVal.length, newVal.length);

    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= oldVal.length) {
        diffs.push({ path: itemPath, oldValue: undefined, newValue: newVal[i] });
      } else if (i >= newVal.length) {
        diffs.push({ path: itemPath, oldValue: oldVal[i], newValue: undefined });
      } else {
        diffs.push(...deepDiff(oldVal[i], newVal[i], itemPath));
      }
    }
    return diffs;
  }

  // One is an array but the other is not
  if (Array.isArray(oldVal) !== Array.isArray(newVal)) {
    return [{ path, oldValue: oldVal, newValue: newVal }];
  }

  // Plain object
  const objOldKeys = Object.keys(oldVal);
  const objNewKeys = Object.keys(newVal);
  const allKeys = new Set([...objOldKeys, ...objNewKeys]);
  const diffs = [];

  for (const key of allKeys) {
    const keyPath = `${path}.${key}`;
    if (!(key in oldVal)) {
      diffs.push({ path: keyPath, oldValue: undefined, newValue: newVal[key] });
    } else if (!(key in newVal)) {
      diffs.push({ path: keyPath, oldValue: oldVal[key], newValue: undefined });
    } else {
      diffs.push(...deepDiff(oldVal[key], newVal[key], keyPath));
    }
  }

  return diffs;
}

/**
 * Compare two outputs safely.
 */
function compareOutputs(oldOutput, newOutput) {
  try {
    const diffs = deepDiff(oldOutput, newOutput, '$');
    return {
      match: diffs.length === 0,
      diffCount: diffs.length,
      diffs: diffs
    };
  } catch (err) {
    return {
      error: 'Failed to compute diff',
      details: err.message
    };
  }
}

module.exports = {
  compareOutputs,
  deepDiff
};
