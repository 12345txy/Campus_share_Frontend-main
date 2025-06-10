<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-alert type="info" border="left" colored-border elevation="2">
          欢迎管理员！您可以在此进行系统配置和管理。
        </v-alert>
      </v-col>
    </v-row>

    <!-- 按钮或链接来跳转到公告发布和管理员配置 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined elevation="1" class="hoverable" @click="goToAnnouncement">
          <v-card-title>
            <v-icon left color="primary">mdi-bell</v-icon>
            公告发布
          </v-card-title>
          <v-card-text>
            管理员可以创建和发布节假日公告。
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined elevation="1" class="hoverable" @click="goToAdminSettings">
          <v-card-title>
            <v-icon left color="green">mdi-account-settings</v-icon>
            管理员配置
          </v-card-title>
          <v-card-text>
            管理员可以设置系统参数和权限。
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  methods: {
    goToAnnouncement() {
      this.$router.push('/admin/system/announcement');
    },
    goToAdminSettings() {
      this.$router.push('/admin/system/settings');
    },
  },
};
</script>
