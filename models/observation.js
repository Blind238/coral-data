"use strict";
// Observation, sample, data point. Rename with more appropriate title?
module.exports = (sequelize, DataTypes) => {
  var observation = sequelize.define('observation', {
    lat: DataTypes.DOUBLE,
    lon: DataTypes.DOUBLE,
    depth: DataTypes.DOUBLE,
    temp: DataTypes.DOUBLE
    // not sure if filename/descriptor or image file makes more sense DB will be huge with files
    // ,image: DataTypes.STRING ??
    // ,image: DataTypes.BLOB /* returns buffer */
  });

  return observation;
};