<template>
  <v-card>
    <v-layout row>
      <v-flex>
        <v-list>
          <v-list-tile>
            <v-list-tile-content>lattitude: {{ lat }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>longitude: {{ lon }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>depth: {{ depth }} meters</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>temperature: {{ temp }}&deg; Celcius </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex>
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
    </v-layout>
  </v-card>
</template>

<script>
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
