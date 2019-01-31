<template>
  <div ref="mapElement" />
</template>

<script>
import * as L from 'leaflet'
import axios from 'axios'

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

    theMap.on('click', async (e) => {
      let response = await axios.post('/api/observation',
        {
          lat: e.latlng.lat,
          lon: e.latlng.lng
        }
      )

      L.circle([response.data.lat, response.data.lon], {
        className: 'coral',
        radius: 10
      }).addTo(theMap).on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        this.expand({ data: response.data, event: e })
      })
    })

    this.populate()
  },
  methods: {
    fit () {
      theMap.fitBounds(mapBounds)
    },
    populate () {
      axios.get('/api/observation')
        .then(response => {
          response.data && response.data.forEach(entry => {
            let data = entry
            L.circle([data.lat, data.lon], {
              className: 'coral',
              radius: 10
            }).addTo(theMap).on('click', (e) => {
              L.DomEvent.stopPropagation(e)
              this.expand({ data, event: e })
            })
          })
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
