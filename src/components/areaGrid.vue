<template>
  <v-card>
    <v-container grid-list-sm class="container" >
      <v-layout row wrap>
        <v-flex xs2 v-for="(item, index) in grid" :key="index">
          <v-responsive class="item" :class="classified(item)" aspect-ratio="1" @click="focus(item, index)">
            <div>
            </div>
          </v-responsive>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'areaGrid',
  props: {
    grid: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    focus (item, index) {
      this.$emit('focus', { item, index })
    },
    show (item) {
      this.$emit('show', item)
    },
    classified (item) {
      let className = 'other'

      if (item.observations) {
        let sum = item.observations.reduce((previous, observation) => {
          previous.coral = previous.coral + observation.resultCoral
          previous.seagrass = previous.seagrass + observation.resultSeagrass
          previous.sand = previous.sand + observation.resultSand

          return previous
        }, { coral: 0, seagrass: 0, sand: 0 })

        className = Object.keys(sum).map(name => ({ name, sum: sum[name] }))
          .sort((a, b) => b.sum - a.sum)[0].name
      }

      return className
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../legend-colors';
.container {
  width: 200px;
}
.item {
  &.coral { background-color: $coral; }
  &.seagrass { background-color: $seagrass; }
  &.sand { background-color: $sand; }
  &.other { background-color: $other; }
}

</style>
