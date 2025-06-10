<!-- eslint-disable -->
<template>
  <v-container>
    <v-card>
      <v-card-title>
        管理员权限管理
        <v-spacer></v-spacer>
        <v-text-field
          v-model="keyword"
          append-icon="mdi-magnify"
          label="搜索用户名/昵称/邮箱"
          single-line
          hide-details
          @keyup.enter="fetchUsers"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="users"
        :options.sync="options"
        :server-items-length="total"
        :loading="loading"
        class="elevation-1"
      >
        <!-- 状态列 -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="item.status === 0 ? 'green' : 'red'" dark>
            {{ item.status === 0 ? '正常' : '禁用' }}
          </v-chip>
        </template>

        <!-- 权限列 -->
        <template v-slot:item.isAdmin="{ item }">
          <v-btn icon small @click="toggleAdmin(item)">
            <v-icon :color="item.isAdmin === 1 ? 'orange' : 'grey'">
              {{ item.isAdmin === 1 ? 'mdi-shield-account' : 'mdi-account-outline' }}
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AdminSettings',
  data() {
    return {
      keyword: '',
      headers: [
        { text: 'ID', value: 'id' },
        { text: '用户名', value: 'username' },
        { text: '昵称', value: 'nickname' },
        { text: '邮箱', value: 'email' },
        { text: '状态', value: 'status' },
        { text: '权限', value: 'isAdmin' }
      ],
      users: [],
      total: 0,
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 10,
      },
    };
  },
  watch: {
    options: {
      handler() {
        this.fetchUsers();
      },
      deep: true
    }
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      const { page, itemsPerPage } = this.options;
      this.$axios.get('/admin/users', {
        params: {
          page,
          size: itemsPerPage,
          keyword: this.keyword
        }
      }).then(res => {
        if (res.data.code === 200) {
          this.users = res.data.data.records;
          this.total = res.data.data.total;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    toggleAdmin(user) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.username === user.username) {
        this.$root.$showSnackbar('不能修改自己的权限', 'error');
        return;
      }
      const newStatus = user.isAdmin === 1 ? 0 : 1;
      this.$axios.put(`/admin/users/${user.id}/admin`, null, {
        params: { isAdmin: newStatus }
      }).then(() => {
        this.$root.$showSnackbar(
          newStatus === 1 ? '已提升为管理员' : '已降级为普通用户',
          'success'
        );
        this.fetchUsers();
      }).catch(() => {
        this.$root.$showSnackbar('权限修改失败', 'error');
      });
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.v-data-table {
  font-size: 14px;
}
</style>
