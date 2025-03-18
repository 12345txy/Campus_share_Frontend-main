import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
 
// 用来存储数据
const state = {
  routeData: {},
    diary: {
      id:15,
      title: '',
      athor:'',
      content: '',
      location:'',
      rating:5.0,
      heatness:90,
    }
}
// 响应组件中的事件
const actions = {
}
// 操作数据
const mutations = {
  setRouteData(state, payload) {
      state.routeData = payload;
  },
  setDiary(state, diary) {
      state.diary = diary;
  }
}
// 用来将state数据进行加工
const getters = {
 
}
// 新建并暴露store
export default new Vuex.Store({
    state,
    actions,
    mutations,
    getters
})
 