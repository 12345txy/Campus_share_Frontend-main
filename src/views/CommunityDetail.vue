<template>
  <v-app>
    <v-container v-if="!loading && community">
      <!-- 社群信息头部 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="pa-4">
            <div class="d-flex align-start">
              <v-avatar size="80" class="mr-4">
                <v-img :src="community.avatar || defaultAvatar"></v-img>
              </v-avatar>
              
              <div class="flex-grow-1">
                <h1 class="text-h4 font-weight-bold mb-2">{{ community.name }}</h1>
                <p class="text-body-1 grey--text mb-3">{{ community.description || '暂无描述' }}</p>
                
                <div class="d-flex align-center mb-3">
                  <v-chip small color="indigo" text-color="white" class="mr-2">
                    <v-icon small left>mdi-account</v-icon>
                    创建者: {{ ownerName }}
                  </v-chip>
                  <v-chip small color="grey" text-color="white">
                    <v-icon small left>mdi-calendar</v-icon>
                    {{ formatDate(community.createTime) }}
                  </v-chip>
                </div>
                
                <div class="d-flex align-center">
                  <v-btn
                    :color="community.isFavorite ? 'red' : 'grey'"
                    :outlined="!community.isFavorite"
                    @click="toggleFavorite"
                    class="mr-2"
                  >
                    <v-icon left>{{ community.isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                    {{ community.isFavorite ? '已收藏' : '收藏' }}
                  </v-btn>
                  
                  <v-btn
                    v-if="isOwner"
                    color="red"
                    outlined
                    @click="confirmDelete"
                  >
                    <v-icon left>mdi-delete</v-icon>
                    删除社群
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 消息区域 -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span class="text-h6">社群消息</span>
              <v-btn
                color="indigo"
                dark
                small
                @click="scrollToBottom"
              >
                <v-icon small left>mdi-arrow-down</v-icon>
                最新消息
              </v-btn>
            </v-card-title>
            
            <v-divider></v-divider>
            
            <!-- 消息列表 -->
            <div
              ref="messageContainer"
              class="message-container pa-4"
              style="height: 400px; overflow-y: auto;"
            >
              <div v-if="messages.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey lighten-1">mdi-message-outline</v-icon>
                <p class="text-h6 grey--text mt-4">还没有消息</p>
                <p class="grey--text">发送第一条消息开始聊天吧！</p>
              </div>
              
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item mb-3"
              >
                <div class="d-flex align-start">
                  <v-avatar size="32" class="mr-3">
                    <v-img :src="message.avatarUrl || defaultAvatar"></v-img>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <div class="d-flex align-center mb-1">
                      <span class="font-weight-medium">{{ message.username }}</span>
                      <span class="text-caption grey--text ml-2">
                        {{ formatMessageTime(message.createTime) }}
                      </span>
                    </div>
                    <div class="message-content">{{ message.content }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 加载更多按钮 -->
              <div v-if="hasMoreMessages" class="text-center py-2">
                <v-btn
                  text
                  color="indigo"
                  :loading="loadingMessages"
                  @click="loadMoreMessages"
                >
                  加载更多消息
                </v-btn>
              </div>
            </div>
            
            <v-divider></v-divider>
            
            <!-- 发送消息区域 -->
            <div class="pa-4">
              <v-textarea
                v-model="newMessage"
                label="输入消息..."
                rows="2"
                auto-grow
                outlined
                dense
                no-resize
                @keydown.ctrl.enter="sendMessage"
                @keydown.enter.prevent="sendMessage"
                :disabled="sendingMessage"
              >
                <template #append>
                  <v-btn
                    color="indigo"
                    dark
                    small
                    :disabled="!newMessage.trim() || sendingMessage"
                    :loading="sendingMessage"
                    @click="sendMessage"
                  >
                    <v-icon small>mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-textarea>
              <div class="text-caption grey--text">
                按 Enter 发送，Ctrl+Enter 换行
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 加载状态 -->
    <v-container v-if="loading">
      <v-row justify="center" class="mt-8">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="indigo"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 grey--text">加载社群信息中...</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- 错误状态 -->
    <v-container v-if="error">
      <v-row justify="center" class="mt-8">
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="grey lighten-1">mdi-alert-circle</v-icon>
          <h3 class="text-h6 grey--text mt-4">{{ error }}</h3>
          <v-btn color="indigo" @click="fetchCommunityDetail" class="mt-4">
            重新加载
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          您确定要删除社群 "{{ community?.name }}" 吗？此操作无法撤销，所有消息记录都将被删除。
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
  name: 'CommunityDetail',
  data() {
    return {
      // 社群信息
      community: null,
      loading: true,
      error: null,
      
      // 消息相关
      messages: [],
      loadingMessages: false,
      hasMoreMessages: true,
      currentPage: 1,
      pageSize: 20,
      
      // 发送消息
      newMessage: '',
      sendingMessage: false,
      
      // 删除相关
      showDeleteDialog: false,
      deleting: false,
      
      // 其他
      defaultAvatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
      currentUser: null,
      ownerName: '未知用户'
    }
  },
  
  computed: {
    communityId() {
      return this.$route.params.communityId;
    },
    
    isOwner() {
      return this.currentUser && this.community && 
             this.community.ownerId === this.currentUser.id;
    }
  },
  
  mounted() {
    this.getCurrentUser();
    this.fetchCommunityDetail();
  },
  
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') {
          this.currentUser = JSON.parse(userStr);
        }
      } catch (e) {
        console.error('获取用户信息失败:', e);
      }
    },
    
    // 获取社群详情
    async fetchCommunityDetail() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$axios.get(`/communities/${this.communityId}`);
        
        if (response.data.code === 200) {
          this.community = response.data.data;
          
          // 获取消息列表
          await this.fetchMessages();
        } else {
          this.error = response.data.message || '获取社群信息失败';
        }
      } catch (error) {
        console.error('获取社群详情失败:', error);
        this.error = '网络错误，请检查网络连接';
      } finally {
        this.loading = false;
      }
    },
    
    // 获取消息列表
    async fetchMessages(loadMore = false) {
      if (!loadMore) {
        this.loadingMessages = true;
        this.currentPage = 1;
      }
      
      try {
        const response = await this.$axios.get(
          `/communities/${this.communityId}/messages`,
          {
            params: {
              pageNum: this.currentPage,
              pageSize: this.pageSize
            }
          }
        );
        
        if (response.data.code === 200) {
          const newMessages = response.data.data;
          
          if (loadMore) {
            // 加载更多时，插入到列表前面
            this.messages = [...newMessages, ...this.messages];
          } else {
            // 首次加载时，直接设置
            this.messages = newMessages;
            // 滚动到底部
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
          
          // 检查是否还有更多消息
          this.hasMoreMessages = newMessages.length === this.pageSize;
        }
      } catch (error) {
        console.error('获取消息失败:', error);
      } finally {
        this.loadingMessages = false;
      }
    },
    
    // 加载更多消息
    async loadMoreMessages() {
      this.currentPage++;
      await this.fetchMessages(true);
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      
      this.sendingMessage = true;
      const messageContent = this.newMessage.trim();
      
      try {
        const response = await this.$axios.post(
          `/communities/${this.communityId}/messages`,
          messageContent,
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        );
        
        if (response.data.code === 200) {
          // 清空输入框
          this.newMessage = '';
          
          // 添加新消息到列表
          const newMessage = response.data.data;
          newMessage.username = this.currentUser?.username || '我';
          newMessage.avatarUrl = this.currentUser?.avatar;
          
          this.messages.push(newMessage);
          
          // 滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$root.$showSnackbar('发送失败，请重试', 'error');
      } finally {
        this.sendingMessage = false;
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    // 切换收藏状态
    async toggleFavorite() {
      if (!this.community) return;
      
      try {
        if (this.community.isFavorite) {
          await this.$axios.delete(`/communities/${this.community.id}/favorite`);
        } else {
          await this.$axios.post(`/communities/${this.community.id}/favorite`);
        }
        
        this.community.isFavorite = !this.community.isFavorite;
        
        const message = this.community.isFavorite ? '已收藏' : '已取消收藏';
        this.$root.$showSnackbar(message, 'success');
      } catch (error) {
        console.error('操作收藏失败:', error);
        this.$root.$showSnackbar('操作失败，请重试', 'error');
      }
    },
    
    // 确认删除
    confirmDelete() {
      this.showDeleteDialog = true;
    },
    
    // 删除社群
    async deleteCommunity() {
      this.deleting = true;
      
      try {
        await this.$axios.delete(`/communities/${this.community.id}`);
        
        this.showDeleteDialog = false;
        this.$root.$showSnackbar('社群已删除', 'success');
        
        // 返回社群列表
        this.$router.push({ name: 'CommunityList' });
      } catch (error) {
        console.error('删除社群失败:', error);
        this.$root.$showSnackbar('删除失败，请重试', 'error');
      } finally {
        this.deleting = false;
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    // 格式化消息时间
    formatMessageTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) {
        return '刚刚';
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    }
  }
}
</script>

<style scoped>
.message-container {
  background-color: #fafafa;
}

.message-item {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.v-textarea >>> .v-input__slot {
  border-radius: 8px;
}
</style> 