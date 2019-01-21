<template>
  <v-app>
    <v-toolbar app dense color="secondary">
      <v-toolbar-title>
        Coral Data
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to="/">Home</v-btn>
        <v-btn flat to="/coral-map">Coral Map</v-btn>
        <v-btn flat to="/about">About</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content class="primary">
      <router-view />
    </v-content>
    <v-footer app color="secondary">

    </v-footer>
  </v-app>
</template>

<style lang="scss">
html {
  overflow-y: auto;
}
</style>
