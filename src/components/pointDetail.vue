<template>
  <v-card>
    <v-layout row wrap style="width: 600px">
      <v-flex xs7>
        <v-list v-for="observation in observations" :key="observation.id">
          <v-list-tile>
            <v-list-tile-content>lattitude: {{ observation.lat }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>longitude: {{ observation.lon }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>depth: {{ observation.depth }} meters</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>temperature: {{ observation.temp }}&deg; Celcius </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              coral: {{ observation.resultCoral }},
              seagrass: {{ observation.resultSeagrass }},
              sand: {{ observation.resultSand }}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex xs5>
        <v-container grid-list-sm>
          <v-layout column align-end>
            <v-flex>
              <v-card>
                <v-img class="observation" contain :src="imgUrl">
                </v-img>
              </v-card>
            </v-flex>
            <v-flex>
              <v-btn @click="$emit('close')">Close</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
      <v-flex xs12>
        <v-btn color="success" @click="show">Show</v-btn>
        <v-btn flat @click="submit('coral')">Set Coral</v-btn>
        <v-btn flat @click="submit('seagrass')">Set Seagrass</v-btn>
        <v-btn flat @click="submit('sand')">Set Sand</v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    lat: {
      type: Number,
      default: 0
    },
    lon: {
      type: Number,
      default: 0
    },
    depth: {
      type: Number,
      default: 0
    },
    temp: {
      type: Number,
      default: 0
    },
    imgUrl: {
      type: String,
      default: ''
    },
    bounds: {
      type: Object,
      default: () => ({})
    },
    center: {
      type: Object,
      default: () => ({})
    },
    resultCoral: {
      type: Number,
      default: 0
    },
    resultSeagrass: {
      type: Number,
      default: 0
    },
    resultSand: {
      type: Number,
      default: 0
    },
    observations: {
      type: Array,
      default: () => null
    }
  },
  methods: {
    show () {
      this.$emit('show', this)
    },
    async submit (type) {
      let response
      switch (type) {
        case 'coral':
          response = await axios.post('/api/observation', {
            lat: this.center.lat,
            lon: this.center.lon,
            resultCoral: 0.9
          })
          break
        case 'seagrass':
          response = await axios.post('/api/observation', {
            lat: this.center.lat,
            lon: this.center.lon,
            resultSeagrass: 0.9
          })
          break
        case 'sand':
          response = await axios.post('/api/observation', {
            lat: this.center.lat,
            lon: this.center.lon,
            resultSand: 0.9
          })
          break
      }

      this.$emit('update', response.data)
    }
  }
}
</script>

<style scoped>
.observation {
  height: 160px;
  width: 160px;
  background-color: #0097A7;
}

@media (max-width: 850px) {
  .observation {
    height: 100px;
    width: 100px;
  }
}
</style>
