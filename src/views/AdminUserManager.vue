<template>
  <v-container>
    <v-card>
      <v-card-title>
        用户管理
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
       <!-- eslint-disable-next-line -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="item.status === 0 ? 'green' : 'red'" dark>
            {{ item.status === 0 ? '正常' : '禁用' }}
          </v-chip>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.isAdmin="{ item }">
          <v-icon :color="item.isAdmin === 1 ? 'orange' : 'grey'">
            {{ item.isAdmin === 1 ? 'mdi-shield-account' : 'mdi-account' }}
          </v-icon>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="toggleStatus(item)">
            <v-icon color="blue">
              {{ item.status === 0 ? 'mdi-block-helper' : 'mdi-check-circle-outline' }}
            </v-icon>
          </v-btn>
          <v-btn icon @click="deleteUser(item)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "AdminUserManager",
  data() {
    return {
      keyword: "",
      headers: [
        { text: "ID", value: "id" },
        { text: "用户名", value: "username" },
        { text: "昵称", value: "nickname" },
        { text: "邮箱", value: "email" },
        { text: "状态", value: "status" },
        { text: "管理员", value: "isAdmin" },
        { text: "操作", value: "actions", sortable: false },
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
      deep: true,
    },
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      const { page, itemsPerPage } = this.options;
      this.$axios
        .get("/admin/users", {
          params: {
            page,
            size: itemsPerPage,
            keyword: this.keyword,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.users = res.data.data.records;
            this.total = res.data.data.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    toggleStatus(user) {
      const newStatus = user.status === 0 ? 1 : 0;
      this.$axios
        .put(`/admin/users/${user.id}/status`, null, {
          params: { status: newStatus },
        })
        .then(() => {
          this.$root.$showSnackbar("状态更新成功", "success");
          this.fetchUsers();
        });
    },
    deleteUser(user) {
      this.$axios
        .delete(`admin/users/${user.id}`)
        .then(() => {
          this.$root.$showSnackbar("用户删除成功", "success");

          this.fetchUsers();
        });
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.v-data-table {
  font-size: 14px;
}
</style>
