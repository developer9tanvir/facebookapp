
/**
 * create a random number
 * @param {*} min
 * @param {*} max
 * @returans
 */

export const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
  }