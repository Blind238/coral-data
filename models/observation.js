'use strict'
// Observation, sample, data point. Rename with more appropriate title?
module.exports = (sequelize, DataTypes) => {
  var observation = sequelize.define('observation', {
    lat: { type: DataTypes.DOUBLE, allowNull: false },
    lon: { type: DataTypes.DOUBLE, allowNull: false },
    depth: DataTypes.DOUBLE,
    temp: DataTypes.DOUBLE
    // not sure if filename/descriptor or image file makes more sense DB will be huge with files
    // ,image: DataTypes.STRING ??
    // ,image: DataTypes.BLOB /* returns buffer */
  })

  return observation
}
