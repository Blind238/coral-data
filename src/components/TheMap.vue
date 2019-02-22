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
  smaller: 0.002,
  middle: 0.004,
  larger: 0.008
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
      if (zoomLevel >= 15) {
        if (scaleValue !== scales.smaller) {
          scaleValue = scales.smaller
          this.repopulate()
        }
      } else if (zoomLevel <= 12.5) {
        if (scaleValue !== scales.larger) {
          scaleValue = scales.larger
          this.repopulate()
        }
      } else {
        if (scaleValue !== scales.middle) {
          scaleValue = scales.middle
          this.repopulate()
        }
      }
    },
    repopulate () {
      // destroy
      theLayers.forEach(rect => rect.remove())
      // rebuild
      this.populate()
    },
    async populate () {
      // axios.get('/api/observation')
      //   .then(response => {
      //     response.data && response.data.forEach(entry => {
      //       let data = entry
      //       L.circle([data.lat, data.lon], {
      //         className: 'coral',
      //         radius: 10
      //       }).addTo(theMap).on('click', (e) => {
      //         L.DomEvent.stopPropagation(e)
      //         this.expand({ data, event: e })
      //       })
      //     })
      //   })

      // lat increase is up
      // lon increase is right (-69 to -68 is right)

      let lat = 12.458
      let lon = -69.975

      // 0.004 works up to zoomlevel 13,
      // need larger value for 12.5, need smaller for 15
      if (!scaleValue) { scaleValue = scales.larger }
      const scale = val => val * scaleValue

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

      let areaContentPromises = []
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (!(
            (y === 0 && x > 2) ||
            (y === 1 && x > 3) ||
            (y === 2 && x > 4)
          )) {
            let bounds = [
              [
                lat - scale(y),
                lon + scale(x)
              ],
              [
                lat - scale(y - 1),
                lon + scale(x - 1)
              ]
            ]

            areaContentPromises.push(axios.get('/api/observation/area/summary', {
              params: {
                lattop: bounds[1][0],
                latbottom: bounds[0][0],
                lonleft: bounds[1][1],
                lonright: bounds[0][1]
              }
            }))
          }
        }
      }

      let areaContents = await Promise.all(areaContentPromises)

      areaContents.forEach(areaContent => {
        let { coral, seagrass, sand, bounds: srcBounds } = areaContent.data

        if (!(coral || seagrass || sand)) {
          // return
        }

        let className = Object.keys(areaContent.data)
          .map((v, i) => ({ name: v, count: areaContent.data[v] }))
          .sort((a, b) => b.count - a.count)[0].name

        if (!(coral || seagrass || sand)) {
          className = 'other'
        }

        let latlngBounds = [
          [srcBounds.lattop, srcBounds.lonleft],
          [srcBounds.latbottom, srcBounds.lonright]
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
