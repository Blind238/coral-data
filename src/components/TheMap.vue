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

export default {
  name: 'TheMap',
  mounted () {
    theMap = L.map(this.$refs.mapElement, {
      doubleClickZoom: false,
      maxBounds: mapBounds,
      zoomSnap: 0,
      center: mapCenter,
      zoom: 11,
      zoomControl: false,
      minZoom: 10,
      maxZoom: 17
    }).fitBounds(mapBounds)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(theMap)

    L.control.zoom({ position: 'topright' }).addTo(theMap)
    L.control.scale({ imperial: false }).addTo(theMap)

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
    async populate () {
      // lat increase is up
      // lon increase is right (-69 to -68 is right)

      let lat = 12.458
      let lon = -69.975

      const scale = val => val * 0.004

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

            let areaContents = await axios.get('/api/observation/area/summary', {
              params: {
                lattop: bounds[1][0],
                latbottom: bounds[0][0],
                lonleft: bounds[1][1],
                lonright: bounds[0][1]
              }
            })

            let { coral, seagrass, sand } = areaContents.data

            if (!(coral || seagrass || sand)) {
              // continue
            }

            let className = Object.keys(areaContents.data)
              .map((v, i) => ({ name: v, count: areaContents.data[v] }))
              .sort((a, b) => b.count - a.count)[0].name

            if (!(coral || seagrass || sand)) {
              className = 'other'
            }

            L.rectangle(bounds, {
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
          }
        }
      }
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
