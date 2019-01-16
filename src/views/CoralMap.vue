<template>
<div class="coral-map-container">
  <div ref="coralMap" class="coral-map">

  </div>
  <div class="coral-map-legend">
    Legend:
    <ul>
      <li><span class="coral"></span>Coral</li>
      <li><span class="seagrass"></span>Seagrass</li>
      <li><span class="sand"></span>Sand</li>
      <li><span class="other"></span>Other/Debris</li>
    </ul>
  </div>
  <div class="coral-map-control">
    <button id="fit">Fit</button>
  </div>
</div>
</template>

<script>
import coralMap from '../script/coral-map.js'

export default {
  name: 'coral-map',
  mounted: function () {
    coralMap(this.$refs.coralMap)
    console.log('coral-map.js loaded')
  }
}
</script>

<style lang="scss" scoped>
.coral-map-container {
  position: relative;
}

.coral-map {
  width: 100vw;
  height: calc(100vh - 78px);

  &-legend, &-control {
    position: absolute;
    z-index: 1001;
  }

  &-legend {
    top: 0;
    left: 0;
    margin: 1.5em 2em;
    text-align: left;

    ul { list-style: none; }
    li { margin: 0.5em; }
    span {
      width: 1em;
      height: 1em;
      float: left;
      margin-right: 0.5em;
    }

    .coral { background-color: #f7403a; }
    .seagrass { background-color: #00ad00; }
    .sand { background-color: #fcda90; }
    .other { background-color: #afafaf; }
  }

  &-control {
    top: 0;
    right: 0;
    margin: 1.5em;
    margin-right: 4em;
  }
}

@import '~leaflet/dist/leaflet.css';
</style>
