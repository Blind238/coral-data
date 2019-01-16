<template>
  <div ref="mapElement" />
</template>

<script>
import * as L from 'leaflet'
// import coralMap from '../script/coral-map.js'

let mapBounds = [
  [12.679030488621091, -70.13147196369502],
  [12.365105584082865, -69.8061392216544]
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
      zoomControl: false
    }).fitBounds(mapBounds)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(theMap)

    L.control.zoom({ position: 'topright' }).addTo(theMap)
    L.control.scale({ imperial: false }).addTo(theMap)

    theMap.on('click', async (e) => {
      let response = await fetch('/api/observation', {
        method: 'POST',
        body: JSON.stringify({
          lat: e.latlng.lat,
          lon: e.latlng.lng
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      let data = await response.json()

      L.circle([data.lat, data.lon], {
        color: 'green',
        fillOpacity: 1,
        radius: 10
      }).addTo(theMap).on('click', (e) => {
        L.DomEvent.stopPropagation(e)
      })
    })

    this.populate()
  },
  methods: {
    fit () {
      theMap.fitBounds(mapBounds)
    },
    populate () {
      fetch('/api/observation')
        .then(response => response.json())
        .then(data => {
          data.forEach(entry => {
            L.circle([entry.lat, entry.lon], {
              color: 'green',
              fillOpacity: 1,
              radius: 10
            }).addTo(theMap).on('click', (e) => {
              L.DomEvent.stopPropagation(e)
            })
          })
        })
    }

  }

}
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
</style>
