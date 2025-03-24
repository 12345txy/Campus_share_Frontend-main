import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginRegister from '../views/LoginRegister.vue'
import TravelRecommend from '../views/TravelRecommend.vue'
import RoutePlan from '../views/RoutePlan.vue'
import DiaryManage from '../views/DiaryManage.vue'
import DiaryEdit from '../views/DiaryEdit.vue'
import PlaceSearch from '../views/PlaceSearch.vue'
import FoodRecommend from '../views/FoodRecommend.vue'
import UserProfile from '../views/UserProfile.vue'
import CreatePost from '../views/CreatePost.vue'
import FrontPage from '../views/FrontPage.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/LoginRegister'
  },
  {
    path: '/LoginRegister',
    name: 'LoginRegister',
    component:LoginRegister
  },
  {
    path: '/TravelRecommend',
    name: 'TravelRecommend',
    component: TravelRecommend
  },
   {
    path: '/RoutePlan',
    name: 'RoutePlan',
    component: RoutePlan
  },
   {
    path: '/DiaryManage',
    name: 'DiaryManage',
    component: DiaryManage
  },
  {
    path: '/DiaryEdit',
    name: 'DiaryEdit',
    component: DiaryEdit
  },
  {
    path: '/PlaceSearch',
    name: 'PlaceSearch',
    component: PlaceSearch
  },
  {
    path: '/FoodRecommend',
    name: 'FoodRecommend',
    component: FoodRecommend
  },
  {
  path: '/UserProfile',
  name: 'UserProfile',
  component: UserProfile
  },
  {
    path: '/CreatePost',
    name: 'CreatePost',
    component: CreatePost
  },
  {
    path: '/FrontPage',
    name: 'FrontPage',
    component: FrontPage
  }
   ]

const router = new VueRouter({
  routes
})

export default router
