<template>
  <v-card>
    <v-container grid-list-sm class="container" >
      <v-layout row wrap>
        <v-flex xs2 v-for="(item, index) in grid" :key="item.id">
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
      if (
        !(item.resultCoral ||
          item.resultSeagrass ||
          item.resultSand)
      ) {
        return 'other'
      }

      let results = [
        { name: 'coral', result: item.resultCoral },
        { name: 'seagrass', result: item.resultSeagrass },
        { name: 'sand', result: item.resultSand }
      ]
      // sort descending
      results.sort((a, b) => b.result - a.result)

      return results[0].name
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
