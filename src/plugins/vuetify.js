import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
// import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: '#00B0FF',
    // primary: colors.cyan.darken2,
    // primary: colors.blue.lighten1,
    secondary: '#FF193B',
    // secondary: '#FFFF8D',
    // secondary: '#FFC400',
    // secondary: '#EC407A',
    // secondary: '#FF80AB',
    // secondary: colors.yellow.lighten1,
    // secondary: colors.pink.lighten1,
    accent: '#FFF400',
    // accent: '#82B1FF',
    // accent: '#FF80AB',
    // accent: '#283593',
    // accent: '#388E3C',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  },
  customProperties: true,
  iconfont: 'md'
})
// #00B0FF, #FFFF8D, #FF80AB
// #00B0FF, #FFC400, #283593
// #00B0FF, #EC407A, #388E3C
// #00B0FF, #FFF400, #FF193B
