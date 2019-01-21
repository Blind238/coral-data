<template>
  <v-container fluid fill-height class="coral-map-container">
    <v-layout row>
      <v-flex grow>
        <TheMap ref="theMap" class="coral-map" />
        <div class="coral-map-legend">
          Legend:
          <ul>
            <li><span class="coral"></span>Coral</li>
            <li><span class="seagrass"></span>Seagrass</li>
            <li><span class="sand"></span>Sand</li>
            <li><span class="other"></span>Other/Debris</li>
          </ul>
        </div>
        <v-card class="coral-map-control">
          <v-btn id="fit" @click="fit">Fit</v-btn>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TheMap from '@/components/TheMap.vue'

export default {
  name: 'coral-map',
  components: {
    TheMap
  },
  methods: {
    fit () {
      this.$refs.theMap.fit()
    }
  }
}
</script>

<style lang="scss">
  @import '../legend-colors';

// allow the toolbar's shadow to show on top of the map
.v-toolbar {
  z-index: 1001;
}

@mixin path-style($color) {
  stroke: $color !important;
  fill: $color !important;
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

.coral-map {
  height: 100%;

  &-legend, &-control {
    position: absolute;
    // make sure our elements render on top of the map
    z-index: 1001;
  }

  &-legend {
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

  &-control {
    top: 0;
    right: 0;
    margin: 1rem 4.5rem;
  }
}
</style>
