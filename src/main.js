import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import G6 from '@antv/g6';
import axios from 'axios';
import store from './store/index';
Vue.prototype.$axios = axios;
Vue.use(G6);

import CommentItem from '@/views/CommentItem.vue';
Vue.component('CommentItem', CommentItem);
axios.defaults.baseURL = '/api'; 
axios.defaults.timeout = 30000;
axios.defaults.headers.common['Content-Type'] = 'application/json';
// 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
    console.log("token的值为",token);
    if (token) {
      // 附加token到Authorization头
        console.log("添加头");
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
