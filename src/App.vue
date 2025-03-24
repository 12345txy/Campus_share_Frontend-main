<template>
  <v-app id="root">
    <template v-if="$route.path != '/LoginRegister'">
      <!-- 侧边导航栏 -->
      <v-navigation-drawer v-model="drawer" class="d-none d-sm-none d-md-flex " app>
        <v-list-item class="mt-12 d-flex flex-column">
          <v-list-item-content>
            <v-list-item-title style="font-weight: bold;font-size:40px;">校园印记</v-list-item-title>
            <v-list-item-subtitle style="font-weight: bold;font-size:30px;">Welcome!</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :style="{ 'border-bottom-width': '1px' }" class="mx-8 my-2"></v-divider>
        <v-list-item-title class="ml-5 mb-1 indigo--text text-h5 font-weight-black">
          <v-icon color="indigo" class="mb-1 mr-1" large>
            mdi-apple-safari
          </v-icon>
          NaviBar
        </v-list-item-title>
        <v-divider :style="{ 'border-bottom-width': '1px' }" class="mx-8 my-2"></v-divider>

        <v-list dense nav>
          <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" link class="align-center" mandatory
            color="indigo">
            <!-- 使用 mx-n 类来减少图标和内容之间的间距 -->
            <v-list-item-avatar :color="item.iconColor" class="d-flex align-center justify-center" min-width="30"
              min-height="30" rounded="circle">
              <v-icon color="white" class="ma-0">{{ item.icon }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title style="font-size: 16px; font-weight: bold;">{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-bottom-navigation fixed style="background:none;">
          <v-card class="d-flex flex-row-reverse justify-center mb-8" style="background:none;" flat hover light>
            <v-btn class="mt-7 mb-7" text small depressed fab plain block
              onclick="window.open('https://github.com/112292454/DSlab.git')"> <v-icon>
                mdi-github
              </v-icon>
            </v-btn>
          </v-card>
        </v-bottom-navigation>
      </v-navigation-drawer>
      <!-- 顶部导航栏 -->
      <v-app-bar elevation="5" app color="indigo" dark dense border="bottom">
        <div class="d-flex align-center">
          <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          <v-toolbar-title>{{currentItemTitle}}</v-toolbar-title>
        </div>
      </v-app-bar>
    </template>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        drawer: false,
        menuItems: [
          { title: '游学推荐', icon: 'mdi-map', iconColor: 'success', to: '/TravelRecommend' },
          { title: '路线规划', icon: 'mdi-navigation-variant', iconColor: 'purple', to: '/RoutePlan' },
          { title: '场所查询', icon: 'mdi-magnify', iconColor: 'blue', to: '/PlaceSearch' },
          { title: '游学日记', icon: 'mdi-book', iconColor: 'brown', to: '/DiaryManage' },
          { title: '美食推荐', icon: 'mdi-pasta', iconColor: 'deep-orange', to: '/FoodRecommend' },
          { title: '个人主页', icon: 'mdi-account-circle', iconColor: 'indigo', to: '/UserProfile' },
          { title: '发布帖子', icon: 'mdi-pencil', iconColor: 'blue', to: '/CreatePost' },
          { title: '首页', icon: 'mdi-vuejs', iconColor: 'green', to: '/FrontPage' },
        ],
        currentItemTitle: '欢迎来到游学系统', // 默认标题
      };
    },
    watch: {

      '$route': {
        handler(to) {
          // 获取当前路由路径对应的菜单项标题
          const currentItem = this.menuItems.find(item => item.to === to.path);
          // 如果找到对应的菜单项，设置标题，否则保持默认标题
          this.currentItemTitle = currentItem ? currentItem.title : '编辑日记';
        },
        immediate: true // 确保在路由变化时立即执行
      }
    },
  };
</script>
<style>
  .list-item-custom-height {
    height: 50px;
  }
</style>