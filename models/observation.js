'use strict'
const Op = require('sequelize').Op

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

  observation.area = (ctxQuery) => {
    let { lattop, latbottom, lonleft, lonright } = ctxQuery

    return observation.findAll({
      where: {
        lat: {
          [Op.between]: [latbottom, lattop]
        },
        lon: {
          [Op.between]: [lonleft, lonright]
        }
      }
    })
  }

  observation.areaSummary = async (ctxQuery) => {
    let { lattop, latbottom, lonleft, lonright } = ctxQuery
    let coralCount = await observation.count({
      where: {
        lat: {
          [Op.between]: [latbottom, lattop]
        },
        lon: {
          [Op.between]: [lonleft, lonright]
        },
        resultCoral: { [Op.gt]: 0.8 }
      }
    })
    let seagrassCount = await observation.count({
      where: {
        lat: {
          [Op.between]: [latbottom, lattop]
        },
        lon: {
          [Op.between]: [lonleft, lonright]
        },
        resultSeagrass: { [Op.gt]: 0.8 }
      }
    })
    let sandCount = await observation.count({
      where: {
        lat: {
          [Op.between]: [latbottom, lattop]
        },
        lon: {
          [Op.between]: [lonleft, lonright]
        },
        resultSand: { [Op.gt]: 0.8 }
      }
    })

    return {
      coral: coralCount,
      seagrass: seagrassCount,
      sand: sandCount
    }
  }

  return observation
}
