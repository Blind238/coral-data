<template>
  <div ref="mapElement" />
</template>

<script>
import * as L from 'leaflet'
import axios from 'axios'

let mapBounds = [
  [12.77, -71.13],
  [12.26, -68.80]
]
let mapCenter = [12.515, -69.96]

let theMap
let theLayers = []

let scaleValue

const scales = {
  smallest: {
    map: 0.001,
    size: 256
  },
  smaller: {
    map: 0.002,
    size: 128
  },
  middle: {
    map: 0.004,
    size: 64
  },
  larger: {
    map: 0.008,
    size: 32
  }
}

export default {
  name: 'TheMap',
  data () {
    return {
      tileSize: Object
    }
  },
  mounted () {
    theMap = L.map(this.$refs.mapElement, {
      doubleClickZoom: false,
      // maxBounds: mapBounds,
      zoomSnap: 0.5,
      wheelPxPerZoomLevel: 120,
      center: mapCenter,
      zoom: 11,
      zoomControl: false,
      // minZoom: 10,
      maxZoom: 17
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(theMap)

    L.control.zoom({ position: 'topright' }).addTo(theMap)
    L.control.scale({ imperial: false }).addTo(theMap)

    theMap.on('zoom', this.zoomListener)

    this.populate()
  },
  methods: {
    fit () {
      theMap.fitBounds(mapBounds)
    },
    show ({ bounds, center }) {
      if (bounds) {
        let rect = L.rectangle([[bounds.top, bounds.left], [bounds.bottom, bounds.right]])
          .addTo(theMap)
        setTimeout(() => {
          rect.remove()
        }, 3000)
      }

      if (center) {
        let circ = L.circle([center.lat, center.lon], { radius: 5 })
          .addTo(theMap)
        setTimeout(() => {
          circ.remove()
        }, 4000)
      }
    },
    zoomListener () {
      const zoomLevel = theMap.getZoom()
      let hasChanged = false
      // 0.004 works up to zoomlevel 13,
      // need larger value for 12.5, need smaller for 15
      if (zoomLevel >= 16.5) {
        if (scaleValue !== scales.smallest) {
          scaleValue = scales.smallest
          hasChanged = true
        }
      } else if (zoomLevel >= 15) {
        if (scaleValue !== scales.smaller) {
          scaleValue = scales.smaller
          hasChanged = true
        }
      } else if (zoomLevel <= 13) {
        if (scaleValue !== scales.larger) {
          scaleValue = scales.larger
          hasChanged = true
        }
      } else {
        if (scaleValue !== scales.middle) {
          scaleValue = scales.middle
          hasChanged = true
        }
      }

      if (hasChanged) {
        this.repopulate()
      }
    },
    repopulate () {
      // destroy
      theLayers.forEach(rect => rect.remove())
      // rebuild
      this.populate()
    },
    async populate () {
      // lat increase is up
      // lon increase is right (-69 to -68 is right)

      let lat = 12.646
      let lon = -70.092

      if (!scaleValue) { scaleValue = scales.larger }
      const scale = val => val * scaleValue.map

      let refBounds = {
        topLeft: L.latLng([lat + scale(1), lon]),
        bottomLeft: L.latLng([lat - scale(1), lon]),
        topRight: L.latLng([lat, lon + scale(1)])
      }

      this.tileSize = {
        width: refBounds.topLeft.distanceTo(refBounds.topRight),
        height: refBounds.topLeft.distanceTo(refBounds.bottomLeft)
      }

      this.$emit('tile-size', this.tileSize)

      let viewport = theMap.getBounds()

      let gridResponse = await axios.get('/api/observation/grid', {
        params: {
          size: scaleValue.size,
          top: lat,
          left: lon,
          stepSize: scaleValue.map,
          viewtop: viewport.getNorth(),
          viewbottom: viewport.getSouth(),
          viewleft: viewport.getWest(),
          viewright: viewport.getEast()
          // ,withempty: true
        }
      })

      gridResponse.data.forEach(section => {
        let { observations, bounds } = section
        let className = 'other'

        if (observations) {
          let sum = observations.reduce((previous, observation) => {
            previous.coral = previous.coral + observation.resultCoral
            previous.seagrass = previous.seagrass + observation.resultSeagrass
            previous.sand = previous.sand + observation.resultSand

            return previous
          }, { coral: 0, seagrass: 0, sand: 0 })

          className = Object.keys(sum)
            .map(name => ({ name, sum: sum[name] }))
            .sort((a, b) => b.sum - a.sum)[0].name
        }

        let latlngBounds = [
          [bounds.top, bounds.left],
          [bounds.bottom, bounds.right]
        ]

        let rect = L.rectangle(latlngBounds, {
          className
        }).addTo(theMap).on('click', (e) => {
          let bounds = e.target.getBounds()

          this.$emit('area', {
            lat: e.latlng.lat,
            lon: e.latlng.lng,
            bounds: {
              top: bounds.getNorth(),
              bottom: bounds.getSouth(),
              left: bounds.getWest(),
              right: bounds.getEast()
            }
          })
        })

        theLayers.push(rect)
      })
    },
    expand (point) {
      this.$emit('expand-point', point)
    }

  }

}
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
</style>
