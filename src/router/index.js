import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginRegister from '../views/LoginRegister.vue'
import UserProfile from '../views/UserProfile.vue'
import CreatePost from '../views/CreatePost.vue'
import FrontPage from '../views/FrontPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminUserManager from '../views/AdminUserManager.vue'
import AdminStatistics from '../views/AdminStatistics.vue'
import AdminSystem from '../views/AdminSystem.vue'
import AdminAnnouncement from '../views/AdminAnnouncement.vue'
import AdminSettings from '../views/AdminSettings.vue'
import CommunityList from '../views/CommunityList.vue'
import CommunityDetail from '../views/CommunityDetail.vue'
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
    path: '/user-profile/:userId',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue')
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
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUserManager',
    component: AdminUserManager,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/statistics',
    component: AdminStatistics,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: AdminSystem,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/system/announcement',
    name: 'AdminAnnouncement',
    component: AdminAnnouncement,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/system/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAdmin: true }
  },
  {
    path: '/communities',
    name: 'CommunityList',
    component: CommunityList,
    meta: { requiresAuth: true }
  },
  {
    path: '/communities/:communityId',
    name: 'CommunityDetail',
    component: CommunityDetail,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  let user = {};
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('error', e);
    user = {};
  }

  if (to.meta.requiresAdmin && user.isAdmin !== '1' && user.isAdmin !== 1) {
    return next('/FrontPage');
  }

  next();
});


export default router
