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
          [Op.gt]: latbottom,
          [Op.lte]: lattop
        },
        lon: {
          [Op.gt]: lonleft,
          [Op.lte]: lonright
        }
      }
    })
  }

  observation.areaSummary = async (ctxQuery) => {
    let { lattop, latbottom, lonleft, lonright } = ctxQuery
    let coralCount = await observation.count({
      where: {
        lat: {
          [Op.gt]: latbottom,
          [Op.lte]: lattop
        },
        lon: {
          [Op.gt]: lonleft,
          [Op.lte]: lonright
        },
        resultCoral: { [Op.gt]: 0.8 }
      }
    })
    let seagrassCount = await observation.count({
      where: {
        lat: {
          [Op.gt]: latbottom,
          [Op.lte]: lattop
        },
        lon: {
          [Op.gt]: lonleft,
          [Op.lte]: lonright
        },
        resultSeagrass: { [Op.gt]: 0.8 }
      }
    })
    let sandCount = await observation.count({
      where: {
        lat: {
          [Op.gt]: latbottom,
          [Op.lte]: lattop
        },
        lon: {
          [Op.gt]: lonleft,
          [Op.lte]: lonright
        },
        resultSand: { [Op.gt]: 0.8 }
      }
    })

    return {
      coral: coralCount,
      seagrass: seagrassCount,
      sand: sandCount,
      bounds: { lattop, latbottom, lonleft, lonright }
    }
  }

  observation.grid = async (ctxQuery) => {
    let { size, lattop, latbottom, lonleft, lonright, stepSize, viewtop, viewbottom, viewleft, viewright, noempty } = ctxQuery

    let grid = []

    // ensure they are all numbers
    if (size) size *= 1
    if (stepSize) stepSize *= 1
    if (lattop) lattop *= 1
    if (latbottom) latbottom *= 1
    if (lonleft) lonleft *= 1
    if (lonright) lonright *= 1
    if (viewtop) viewtop *= 1
    if (viewbottom) viewbottom *= 1
    if (viewleft) viewleft *= 1
    if (viewright) viewright *= 1

    function viewportContains (bounds) {
      if (bounds.top <= viewtop &&
        bounds.bottom >= viewbottom &&
        bounds.left >= viewleft &&
        bounds.right <= viewright) {
        return true
      } else if (bounds.top >= viewbottom &&
        bounds.bottom <= viewtop &&
        bounds.left <= viewright &&
        bounds.right >= viewleft) {
        return true
      } else {
        return false
      }
    }

    let verticalStep = stepSize || Math.abs((lattop - latbottom) / size)
    let horizontalStep = stepSize || Math.abs((lonleft - lonright) / size)

    // x and y for grid, so y should be top to bottom and x left to right
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let section = {
          bounds: {
            top: lattop - (verticalStep * y),
            bottom: lattop - (verticalStep * (y + 1)),
            left: lonleft + (horizontalStep * x),
            right: lonleft + (horizontalStep * (x + 1))
          },
          center: {
            lat: lattop - (verticalStep * (y + 0.5)),
            lon: lonleft + (horizontalStep * (x + 0.5))
          }
        }

        if (viewtop && viewbottom && viewleft && viewright) {
          if (!viewportContains(section.bounds)) {
            continue
          }
        }

        grid.push(section)
      }
    }

    let gridObservations = await Promise.all(grid.map(section => {
      return observation.area({
        lattop: section.bounds.top,
        latbottom: section.bounds.bottom,
        lonleft: section.bounds.left,
        lonright: section.bounds.right
      })
    }))

    let gridWithObservations = gridObservations.map((observations, index) => {
      return observations.length > 0
        ? { ...grid[index], observations }
        : grid[index]
    })

    if (noempty) {
      gridWithObservations = gridWithObservations.filter(section => (section.observations))
    }

    return gridWithObservations
  }

  return observation
}
