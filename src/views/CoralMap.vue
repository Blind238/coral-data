<template>
  <v-container fluid fill-height class="coral-map-container">
    <v-layout row>
      <v-flex grow>
          <div class="coral-map-legend">
            Legend:
            <ul>
              <li><span class="coral"></span>Coral</li>
              <li><span class="seagrass"></span>Seagrass</li>
              <li><span class="sand"></span>Sand</li>
              <li><span class="other"></span>Other/Debris</li>
            </ul>
          </div>
        <div class="map-container">
          <TheMap ref="theMap" class="coral-map" @expand-point="expand" @area="area" />
        </div>
          <v-card class="coral-map-control">
            <v-btn id="fit" @click="fit">Fit</v-btn>
          </v-card>
          <point-detail v-if="pointData" v-bind="pointData" class="coral-map-detail" @close="pointData = null; focusedIndex = null" @show="show" @update="updatePoint"/>
          <area-grid v-if="grid" :grid="grid" class="coral-map-area-grid" @focus="expand" @show="show"></area-grid>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TheMap from '@/components/TheMap.vue'
import pointDetail from '@/components/pointDetail.vue'
import areaGrid from '@/components/areaGrid.vue'
import axios from 'axios'

export default {
  name: 'coral-map',
  data () {
    return {
      pointData: null,
      focusedIndex: null,
      grid: null
    }
  },
  components: {
    TheMap,
    pointDetail,
    areaGrid
  },
  methods: {
    fit () {
      this.$refs.theMap.fit()
    },
    expand (point) {
      this.pointData = point.item
      this.focusedIndex = point.index
    },
    updatePoint (item) {
      this.pointData = item
      this.$set(this.grid, this.focusedIndex, item)
    },
    async area ({ lat, lon, bounds, id }) {
      // this.areaGrid = [
      //   /* eslint-disable no-multi-spaces */
      //   [1,   2,  3,  4],
      //   [5,   6,  7,  8],
      //   [9,  10, 11, 12],
      //   [13, 14, 15, 16]
      //   /* eslint-enable no-multi-spaces */
      // ]
      // this.grid = Array.from({ length: (6 * 6) }, (v, n) => ({ id: n + 1, bounds }))
      this.grid = await gridWithinBounds(6, bounds)

      async function gridWithinBounds (gridSize, bounds) {
        let grid = []
        let verticalStep = Math.abs((bounds.top - bounds.bottom) / gridSize)
        let horizontalStep = Math.abs((bounds.left - bounds.right) / gridSize)

        // x and y for grid, so y should be top to bottom and x left to right
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            let section = {
              bounds: {
                top: bounds.top - (verticalStep * y),
                bottom: bounds.top - (verticalStep * (y + 1)),
                left: bounds.left + (horizontalStep * x),
                right: bounds.left + (horizontalStep * (x + 1))
              },
              center: {
                lat: bounds.top - (verticalStep * (y + 0.5)),
                lon: bounds.left + (horizontalStep * (x + 0.5))
              }
            }

            let details = await axios.get('/api/observation/area', {
              params: {
                lattop: section.bounds.top,
                latbottom: section.bounds.bottom,
                lonleft: section.bounds.left,
                lonright: section.bounds.right
              }
            })

            if (details.data.length > 0) {
              let { resultCoral, resultSeagrass, resultSand } = details.data[0]

              section.resultCoral = resultCoral
              section.resultSeagrass = resultSeagrass
              section.resultSand = resultSand
            }

            grid.push(section)
          }
        }
        return grid
      }
    },
    show (observation) {
      this.$refs.theMap.show(observation)
    }
  }
}
</script>

<style lang="scss">
  @import '../legend-colors';
  $map-sea: #aad3df;

// allow the toolbar's shadow to show on top of the map
.v-toolbar {
  z-index: 1001;
}

@mixin path-style($color) {
  // style stroke too look like grid padding
  stroke: $map-sea;
  stroke-width: 4px;
  fill: $color;
  fill-opacity: 1;
}

path {
  &.coral { @include path-style($coral); }
  &.seagrass { @include path-style($seagrass); }
  &.sand { @include path-style($sand); }
  &.other { @include path-style($other); }
}
</style>

<style lang="scss" scoped>
@import '../legend-colors';

.coral-map-container {
  position: relative;
  // override v-container's padding
  padding: 0;
}

.map-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.coral-map {
  height: 100%;

  &-legend, &-control, &-detail, &-area-grid {
    // position: absolute;
    // make sure our elements render on top of the map
    z-index: 1001;
  }

  &-legend {
    position: absolute;
    top: 0;
    left: 0;
    margin: 1.5rem 2rem;
    text-align: left;

    ul { list-style: none; }
    li { margin: 0.5em; }
    span {
      width: 1rem;
      height: 1rem;
      float: left;
      margin-right: 0.5rem;
    }

    .coral { background-color: $coral; }
    .seagrass { background-color: $seagrass; }
    .sand { background-color: $sand; }
    .other { background-color: $other; }
  }

  &-control, &-detail, &-area-grid {
    float: right;
  }

  &-control {
    margin: 1rem;
    margin-right: 4.5rem;
  }

  &-detail, &-area-grid {
    margin: 1rem;
    margin-right: 0;
  }
}
</style>
