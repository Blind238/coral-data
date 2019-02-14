'use strict'
// Observation, sample, data point. Rename with more appropriate title?
module.exports = (sequelize, DataTypes) => {
  var observation = sequelize.define('observation', {
    lat: { type: DataTypes.DOUBLE, allowNull: false },
    lon: { type: DataTypes.DOUBLE, allowNull: false },
    depth: DataTypes.DOUBLE,
    temp: DataTypes.DOUBLE,
    imageUrl: DataTypes.STRING,
    resultCoral: { type: DataTypes.DOUBLE, defaultValue: 0 },
    resultSeagrass: { type: DataTypes.DOUBLE, defaultValue: 0 },
    resultSand: { type: DataTypes.DOUBLE, defaultValue: 0 }
    // ,image: DataTypes.BLOB /* returns buffer */
  })

  return observation
}
