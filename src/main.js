import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import G6 from '@antv/g6';
import axios from 'axios';
import store from './store/index';
Vue.prototype.$axios = axios;
Vue.use(G6);

// // Font Awesome 配置
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// // 导入你需要的图标
// import { faHeart, faComment, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
// import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
// import { faWeixin, faQq } from '@fortawesome/free-brands-svg-icons'

// // 添加图标到库中
// library.add(faHeart, farHeart, faComment, faThumbsUp, faWeixin, faQq)

// // 全局注册组件
// Vue.component('font-awesome-icon', FontAwesomeIcon)
// 设置基础URL和默认配置
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
