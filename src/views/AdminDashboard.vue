<template>
  <v-container fluid>
    <!-- 欢迎语句 -->
    <v-row>
      <v-col cols="12">
        <v-alert type="info" border="left" colored-border elevation="2">
          欢迎您，管理员！您可以在此管理系统用户、配置参数和查看数据统计。
        </v-alert>
      </v-col>
    </v-row>

    <!-- 功能面板 -->
    <v-row>
      <!-- 用户管理 -->
      <v-col cols="12" md="4">
        <v-card outlined elevation="1" class="hoverable" @click="goToUserManager">
          <v-card-title>
            <v-icon left color="primary">mdi-account-group</v-icon>
            用户管理
          </v-card-title>
          <v-card-text>
            查看、编辑、禁用或删除系统用户。
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 数据统计 -->
      <v-col cols="12" md="4">
        <v-card outlined elevation="1" class="hoverable" @click="goToStatistics">
          <v-card-title>
            <v-icon left color="green">mdi-chart-bar</v-icon>
            数据统计
          </v-card-title>
          <v-card-text>
            实时掌握平台运营数据。
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 系统配置 -->
      <v-col cols="12" md="4">
        <v-card outlined elevation="1" class="hoverable" @click="goToSettings">
          <v-card-title>
            <v-icon left color="orange">mdi-cog-outline</v-icon>
            系统配置
          </v-card-title>
          <v-card-text>
            配置网站参数、管理权限策略。
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    goToUserManager() {
      this.$router.push('/admin/users').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error(err);
        }
      });
    },

    goToStatistics() {
      this.$router.push('/admin/statistics'); // 预留
    },
    goToSettings() {
      this.$router.push('/admin/system'); // 预留
    },
  },
};
</script>

<style scoped>
.hoverable {
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}
.hoverable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
