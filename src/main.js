import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import G6 from '@antv/g6';
import axios from 'axios';
import store from './store/index';
Vue.prototype.$axios = axios;
Vue.use(G6);

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
