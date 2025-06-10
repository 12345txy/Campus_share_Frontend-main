<template>
  <v-app>
    <v-container>
      <!-- 页面标题 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold indigo--text">校园印记社群</h1>
              <p class="text-subtitle-1 grey--text">发现志同道合的小伙伴，分享校园生活点滴</p>
            </div>
            <v-btn
              color="indigo"
              dark
              large
              @click="showCreateDialog = true"
              class="mr-2"
            >
              <v-icon left>mdi-plus</v-icon>
              创建社群
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- 搜索和筛选区域 -->
      <v-row class="mb-4">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchKeyword"
            label="搜索社群名称或描述"
            append-icon="mdi-magnify"
            @click:append="searchCommunities"
            @keyup.enter="searchCommunities"
            outlined
            dense
            clearable
            @click:clear="clearSearch"
          >
            <template #prepend-inner>
              <v-icon color="grey">mdi-account-group</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            @click="showMyFavorites = !showMyFavorites"
            :color="showMyFavorites ? 'red' : 'grey'"
            outlined
            block
            class="mt-1"
          >
            <v-icon left>{{ showMyFavorites ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            {{ showMyFavorites ? '显示全部社群' : '我收藏的社群' }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- 社群卡片列表 -->
      <v-row>
        <v-col
          v-for="community in communities"
          :key="community.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="mx-auto community-card"
            hover
            @click="goToCommunityDetail(community)"
          >
            <!-- 社群头像/图片 -->
            <v-img
              :src="community.avatar || defaultCommunityImage"
              height="120"
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            >
              <v-card-title class="text-h6">{{ community.name }}</v-card-title>
            </v-img>

            <v-card-text>
              <div class="text--primary mb-2">
                {{ community.description || '暂无描述' }}
              </div>
              
              <!-- 社群统计信息 -->
              <div class="d-flex align-center text-caption grey--text">
                <v-icon small class="mr-1">mdi-account-multiple</v-icon>
                <span class="mr-3">成员数待定</span>
                <v-icon small class="mr-1">mdi-message</v-icon>
                <span>消息待定</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                small
                text
                color="indigo"
                @click.stop="goToCommunityDetail(community)"
              >
                <v-icon small left>mdi-eye</v-icon>
                查看详情
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <!-- 收藏按钮 - 移除错误的调试代码 -->
              <v-btn
                icon
                small
                :color="community.isFavorite ? 'red' : 'grey'"
                @click.stop="toggleFavorite(community)"
              >
                <v-icon small>
                  {{ community.isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
              </v-btn>

              <!-- 删除按钮（仅创建者可见） -->
              <v-btn
                v-if="isOwner(community)"
                icon
                small
                color="red"
                @click.stop="confirmDelete(community)"
              >
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 分页 -->
      <v-row class="mt-4" v-if="totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @input="fetchCommunities"
            color="indigo"
          ></v-pagination>
        </v-col>
      </v-row>

      <!-- 空状态 - 改进版 -->
      <v-row v-if="!loading && communities.length === 0" class="mt-8">
        <v-col cols="12" class="text-center">
          <v-img
            src="https://cdn.vuetifyjs.com/images/lists/no-data.svg"
            max-width="200"
            class="mx-auto mb-4"
          ></v-img>
          <h3 class="text-h6 grey--text">
            {{ getEmptyStateTitle() }}
          </h3>
          <p class="grey--text">
            {{ getEmptyStateSubtitle() }}
          </p>
          <v-btn
            v-if="!searchKeyword && !showMyFavorites"
            color="indigo"
            dark
            @click="showCreateDialog = true"
          >
            创建社群
          </v-btn>
        </v-col>
      </v-row>

      <!-- 加载状态 -->
      <v-row v-if="loading" class="mt-8">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="indigo"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 grey--text">加载中...</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- 创建社群对话框 -->
    <v-dialog v-model="showCreateDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">创建新社群</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeCreateDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="createForm" v-model="formValid">
            <v-text-field
              v-model="newCommunity.name"
              label="社群名称"
              :rules="nameRules"
              outlined
              dense
              counter="50"
              required
            ></v-text-field>

            <v-textarea
              v-model="newCommunity.description"
              label="社群描述"
              :rules="descriptionRules"
              outlined
              rows="4"
              counter="200"
              hint="描述一下你的社群是做什么的，吸引更多志同道合的朋友"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeCreateDialog">取消</v-btn>
          <v-btn
            color="indigo"
            dark
            :disabled="!formValid || creating"
            :loading="creating"
            @click="createCommunity"
          >
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          您确定要删除社群 "{{ deletingCommunity?.name }}" 吗？此操作无法撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false">取消</v-btn>
          <v-btn
            color="red"
            dark
            :loading="deleting"
            @click="deleteCommunity"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: 'CommunityList',
  data() {
    return {
      // 社群列表数据
      communities: [],
      loading: false,
      
      // 分页相关
      currentPage: 1,
      pageSize: 12,
      totalPages: 1,
      
      // 搜索相关
      searchKeyword: '',
      showMyFavorites: false,
      
      // 创建社群相关
      showCreateDialog: false,
      formValid: false,
      creating: false,
      newCommunity: {
        name: '',
        description: ''
      },
      
      // 删除社群相关
      showDeleteDialog: false,
      deleting: false,
      deletingCommunity: null,
      
      // 验证规则
      nameRules: [
        v => !!v || '社群名称不能为空',
        v => (v && v.length <= 50) || '社群名称不能超过50个字符'
      ],
      descriptionRules: [
        v => !v || v.length <= 200 || '描述不能超过200个字符'
      ],
      
      // 默认图片
      defaultCommunityImage: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
      
      // 当前用户信息
      currentUser: null
    }
  },
  
  mounted() {
    this.getCurrentUser();
    this.fetchCommunities();
  },
  
  watch: {
    showMyFavorites() {
      this.currentPage = 1;
      this.fetchCommunities();
    }
  },
  
  methods: {
    // 获取当前用户信息 - 增强调试版本
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('=== 用户信息调试 ===');
        console.log('localStorage中的user字符串:', userStr);
        console.log('localStorage中的token:', token);
        
        if (userStr && userStr !== 'undefined') {
          this.currentUser = JSON.parse(userStr);
          console.log('解析后的currentUser:', this.currentUser);
          console.log('用户ID:', this.currentUser.id);
          console.log('用户名:', this.currentUser.username);
          console.log('是否管理员:', this.currentUser.isAdmin);
          
          // 检查用户ID是否存在
          if (!this.currentUser.id) {
            console.error('⚠️ 用户ID缺失！需要重新登录以获取完整用户信息');
            this.$root.$showSnackbar('用户信息不完整，请重新登录', 'warning');
            // 可以选择自动跳转到登录页
            // this.$router.push('/LoginRegister');
          }
        } else {
          console.error('用户信息不存在或无效');
          this.$root.$showSnackbar('请先登录', 'error');
        }
      } catch (e) {
        console.error('获取用户信息失败:', e);
        this.$root.$showSnackbar('用户信息异常，请重新登录', 'error');
      }
    },
    
    // 获取社群列表 - 修改版
    async fetchCommunities() {
      this.loading = true;
      try {
        let url, params;
        
        if (this.showMyFavorites) {
          // 获取收藏的社群
          if (!this.currentUser?.id) {
            console.error('用户未登录或用户ID缺失');
            this.$root.$showSnackbar('请先登录', 'error');
            this.loading = false;
            return;
          }
          
          url = '/communities/favorites';
          params = { userId: this.currentUser.id };
          console.log('获取收藏社群，用户ID:', this.currentUser.id);
        } else {
          // 获取所有社群
          url = '/communities';
          params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize
          };
          
          if (this.searchKeyword) {
            params.keyword = this.searchKeyword;
          }
        }
        
        console.log('请求URL:', url);
        console.log('请求参数:', params);
        
        const response = await this.$axios.get(url, { params });
        console.log('响应数据:', response.data);
        
        if (response.data.code === 200) {
          this.communities = response.data.data || [];
          
          // 如果有分页信息，更新分页状态
          if (response.data.totalPages) {
            this.totalPages = response.data.totalPages;
          } else {
            // 收藏列表通常不分页
            this.totalPages = 1;
          }
          
          // 如果不是显示收藏列表，获取每个社群的收藏状态
          if (!this.showMyFavorites) {
            await this.fetchFavoriteStatus();
          } else {
            // 收藏列表中的社群都是已收藏的
            this.communities.forEach(community => {
              community.isFavorite = true;
            });
          }
        }
      } catch (error) {
        console.error('获取社群列表失败:', error);
        console.error('错误详情:', error.response?.data);
        
        let errorMessage = '获取社群列表失败';
        if (error.response?.status === 401) {
          errorMessage = '请先登录';
        } else if (error.response?.status === 403) {
          errorMessage = '没有权限访问';
        }
        
        this.$root.$showSnackbar(errorMessage, 'error');
      } finally {
        this.loading = false;
      }
    },
    
    // 获取收藏状态
    async fetchFavoriteStatus() {
      if (!this.currentUser?.id) return;
      
      for (const community of this.communities) {
        try {
          const response = await this.$axios.get(
            `/communities/${community.id}/isFavorite`,
            { params: { userId: this.currentUser.id } }
          );
          if (response.data.code === 200) {
            community.isFavorite = response.data.data;
          }
        } catch (error) {
          console.error(`获取社群${community.id}收藏状态失败:`, error);
        }
      }
    },
    
    // 搜索社群
    searchCommunities() {
      this.currentPage = 1;
      this.fetchCommunities();
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = '';
      this.currentPage = 1;
      this.fetchCommunities();
    },
    
    // 跳转到社群详情
    goToCommunityDetail(community) {
      this.$router.push({
        name: 'CommunityDetail',
        params: { communityId: community.id }
      });
    },
    
    // 切换收藏状态 - 添加调试信息
    async toggleFavorite(community) {
      console.log('点击收藏按钮，社群信息:', community);
      console.log('当前用户信息:', this.currentUser);
      
      if (!community) {
        console.error('社群信息为空');
        this.$root.$showSnackbar('社群信息错误', 'error');
        return;
      }
      
      if (!community.id) {
        console.error('社群ID为空');
        this.$root.$showSnackbar('社群ID错误', 'error');
        return;
      }
      
      try {
        console.log('当前收藏状态:', community.isFavorite);
        
        if (community.isFavorite) {
          // 取消收藏
          console.log('发送取消收藏请求:', `/communities/${community.id}/favorite`);
          const response = await this.$axios.delete(`/communities/${community.id}/favorite`);
          console.log('取消收藏响应:', response);
        } else {
          // 添加收藏
          console.log('发送添加收藏请求:', `/communities/${community.id}/favorite`);
          const response = await this.$axios.post(`/communities/${community.id}/favorite`);
          console.log('添加收藏响应:', response);
        }
        
        // 更新状态
        community.isFavorite = !community.isFavorite;
        console.log('更新后的收藏状态:', community.isFavorite);
        
        // 强制更新视图
        this.$forceUpdate();
        
        // 如果当前显示收藏列表且取消了收藏，从列表中移除
        if (this.showMyFavorites && !community.isFavorite) {
          const index = this.communities.findIndex(c => c.id === community.id);
          if (index > -1) {
            this.communities.splice(index, 1);
          }
        }
        
        const message = community.isFavorite ? '已收藏' : '已取消收藏';
        this.$root.$showSnackbar(message, 'success');
        
      } catch (error) {
        console.error('操作收藏失败:', error);
        console.error('错误详情:', error.response?.data);
        
        // 显示具体的错误信息
        let errorMessage = '操作失败，请重试';
        if (error.response?.status === 401) {
          errorMessage = '请先登录';
        } else if (error.response?.status === 403) {
          errorMessage = '没有权限执行此操作';
        } else if (error.response?.status === 404) {
          errorMessage = '社群不存在';
        }
        
        this.$root.$showSnackbar(errorMessage, 'error');
      }
    },
    
    // 判断是否为社群创建者
    isOwner(community) {
      return this.currentUser && community.ownerId === this.currentUser.id;
    },
    
    // 确认删除
    confirmDelete(community) {
      this.deletingCommunity = community;
      this.showDeleteDialog = true;
    },
    
    // 删除社群
    async deleteCommunity() {
      if (!this.deletingCommunity) return;
      
      this.deleting = true;
      try {
        await this.$axios.delete(`/communities/${this.deletingCommunity.id}`);
        
        // 从列表中移除
        const index = this.communities.findIndex(c => c.id === this.deletingCommunity.id);
        if (index > -1) {
          this.communities.splice(index, 1);
        }
        
        this.showDeleteDialog = false;
        this.$root.$showSnackbar('社群已删除', 'success');
      } catch (error) {
        console.error('删除社群失败:', error);
        this.$root.$showSnackbar('删除失败，请重试', 'error');
      } finally {
        this.deleting = false;
      }
    },
    
    // 关闭创建对话框
    closeCreateDialog() {
      this.showCreateDialog = false;
      this.newCommunity = { name: '', description: '' };
      if (this.$refs.createForm) {
        this.$refs.createForm.reset();
      }
    },
    
    // 创建社群
    async createCommunity() {
      if (!this.$refs.createForm.validate()) return;
      
      this.creating = true;
      try {
        const response = await this.$axios.post('/communities', {
          name: this.newCommunity.name,
          description: this.newCommunity.description
        });
        
        if (response.data.code === 200) {
          this.closeCreateDialog();
          this.$root.$showSnackbar('社群创建成功！', 'success');
          
          // 重新获取社群列表
          this.fetchCommunities();
        }
      } catch (error) {
        console.error('创建社群失败:', error);
        this.$root.$showSnackbar('创建失败，请重试', 'error');
      } finally {
        this.creating = false;
      }
    },
    
    // 获取空状态标题
    getEmptyStateTitle() {
      if (this.showMyFavorites) {
        return '暂无收藏的社群';
      } else if (this.searchKeyword) {
        return '没有找到相关社群';
      } else {
        return '还没有社群';
      }
    },
    
    // 获取空状态副标题
    getEmptyStateSubtitle() {
      if (this.showMyFavorites) {
        return '快去收藏一些感兴趣的社群吧！';
      } else if (this.searchKeyword) {
        return '试试其他关键词';
      } else {
        return '创建第一个社群，开始你的校园社交之旅！';
      }
    }
  }
}
</script>

<style scoped>
.community-card {
  transition: transform 0.2s ease-in-out;
}

.community-card:hover {
  transform: translateY(-4px);
}

.v-card__title {
  word-break: break-word;
}
</style> 