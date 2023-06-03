const assert = require('assert');

module.exports = 
/**
 * @param {Array} array 
 * @param {string} property
 */
function (array, property, target) {
    assert(array.length > 0, 'List needs to have at least 1 element to be "searched"');
    for (let item of array) if (item[property] == target) return item;
    return false;
}