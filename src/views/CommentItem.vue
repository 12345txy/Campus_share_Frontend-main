<template>
  <div class="comment-wrapper">
    <!-- 主评论 -->
    <v-list-item class="comment-item">
      <v-list-item-avatar>
        <v-img :src="comment.avatar || comment.authorAvatar || defaultAvatar"></v-img>
      </v-list-item-avatar>
      
      <v-list-item-content>
        <v-list-item-title class="font-weight-medium">
          {{ comment.nickname || comment.authorName || '匿名用户' }}
        </v-list-item-title>
        <v-list-item-subtitle class="comment-content mt-1">
          {{ comment.content }}
        </v-list-item-subtitle>
        <div class="d-flex align-center mt-2">
          <span class="caption grey--text text--darken-1 mr-3">
            {{ formatTime(comment.createTime) }}
          </span>
          
          <!-- 操作按钮组 - 横向排列 -->
          <div class="comment-actions d-flex align-center flex-wrap">
            <!-- 回复按钮 -->
            <v-btn x-small text color="primary" class="mr-2" @click="prepareReply(comment)">
              <v-icon small left>mdi-reply</v-icon>
              回复
            </v-btn>
            
            <!-- 点赞按钮和数量 -->
            <div class="d-flex align-center mr-3">
              <v-btn 
                icon 
                x-small 
                :color="comment.isLiked ? 'indigo' : 'grey'" 
                class="mr-1" 
                @click.stop="toggleCommentLike(comment, $event)"
              >
                <v-icon small>{{ comment.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
              </v-btn>
              <span class="caption">{{ comment.likeCount || 0 }}</span>
            </div>
            
            <!-- 查看回复按钮和数量 -->
            <div v-if="comment.replyCount > 0" class="d-flex align-center">
              <v-btn 
                x-small 
                text 
                color="blue" 
                class="mr-1"
                @click="toggleShowReplies(comment)"
              >
                <v-icon small left>mdi-message-reply-outline</v-icon>
                {{ comment.showReplies ? '收起' : '展开' }}
              </v-btn>
              <span class="caption">{{ comment.replyCount || 0 }}</span>
            </div>
          </div>
        </div>
      </v-list-item-content>
    </v-list-item>
    
    <!-- 子评论显示在下方 - 增强缩进效果 -->
    <div v-if="comment.showReplies && comment.replies && comment.replies.length" class="comment-replies-container">
      <!-- 连接线 -->
      <div class="reply-connector"></div>
      
      <!-- 子评论区域 -->
      <div class="comment-replies">
        <template v-for="(reply, replyIndex) in comment.replies">
          <!-- 子评论项 -->
          <div class="reply-item" :key="reply.id || 'reply-' + replyIndex">
            <div class="reply-line"></div>
            <div class="reply-content">
              <v-list-item class="comment-item reply-comment">
                <v-list-item-avatar size="32">
                  <v-img :src="reply.avatar || reply.authorAvatar || defaultAvatar"></v-img>
                </v-list-item-avatar>
                
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium text-body-2">
                    {{ reply.nickname || reply.authorName || '匿名用户' }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="comment-content mt-1">
                    {{ reply.content }}
                  </v-list-item-subtitle>
                  <div class="d-flex align-center mt-2">
                    <span class="caption grey--text text--darken-1 mr-3">
                      {{ formatTime(reply.createTime) }}
                    </span>
                    
                    <!-- 子评论操作按钮 -->
                    <div class="comment-actions d-flex align-center">
                      <!-- 回复按钮 -->
                      <v-btn x-small text color="primary" class="mr-2" @click="prepareReply(reply)">
                        <v-icon small left>mdi-reply</v-icon>
                        回复
                      </v-btn>
                      
                      <!-- 点赞按钮 -->
                      <div class="d-flex align-center">
                        <v-btn 
                          icon 
                          x-small 
                          :color="reply.isLiked ? 'indigo' : 'grey'" 
                          class="mr-1" 
                          @click.stop="toggleCommentLike(reply, $event)"
                        >
                          <v-icon small>{{ reply.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                        </v-btn>
                        <span class="caption">{{ reply.likeCount || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    toggleShowReplies: {
      type: Function,
      required: true
    },
    prepareReply: {
      type: Function,
      required: true
    },
    toggleCommentLike: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      defaultAvatar: 'https://cdn.vuetifyjs.com/images/john.jpg'
    }
  },
  methods: {
    formatTime(dateString) {
      if (!dateString) return '刚刚';
      
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 如果时间差小于1分钟
        if (diff < 60000) {
          return '刚刚';
        }
        // 如果时间差小于1小时
        else if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          return `${minutes}分钟前`;
        }
        // 如果时间差小于24小时
        else if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000);
          return `${hours}小时前`;
        }
        // 如果时间差小于7天
        else if (diff < 604800000) {
          const days = Math.floor(diff / 86400000);
          return `${days}天前`;
        }
        // 超过7天，显示具体日期
        else {
          return date.toLocaleDateString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          });
        }
      } catch (error) {
        console.error('时间格式化错误:', error);
        return '时间未知';
      }
    }
  }
};
</script>

<style scoped>
.comment-wrapper {
  width: 100%;
}

.comment-item {
  padding: 12px 16px;
}

.comment-content {
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.comment-actions {
  gap: 8px;
}

/* 子评论容器样式 */
.comment-replies-container {
  position: relative;
  margin-top: 8px;
}

/* 连接线样式 */
.reply-connector {
  position: absolute;
  left: 32px;
  top: 0;
  width: 2px;
  height: 16px;
  background-color: #e0e0e0;
}

/* 子评论区域 */
.comment-replies {
  margin-left: 48px; /* 增加缩进 */
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
  background-color: #fafafa;
  border-radius: 0 8px 8px 0;
}

/* 单个回复项 */
.reply-item {
  position: relative;
  margin-bottom: 8px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

/* 子评论连接线 */
.reply-line {
  position: absolute;
  left: -18px;
  top: 20px;
  width: 16px;
  height: 2px;
  background-color: #e0e0e0;
}

/* 子评论内容 */
.reply-content {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  margin-left: 0;
}

/* 子评论样式调整 */
.reply-comment {
  padding: 8px 12px;
  background-color: transparent;
}

.reply-comment .v-list-item__avatar {
  margin-right: 12px;
}

.reply-comment .v-list-item__title {
  font-size: 0.875rem;
}

/* 按钮样式优化 */
.v-btn--x-small {
  min-width: auto !important;
  padding: 0 8px !important;
}

.v-btn--x-small .v-icon {
  font-size: 16px !important;
}

/* 确保操作按钮横向排列 */
.comment-actions {
  flex-direction: row !important;
  align-items: center !important;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .comment-replies {
    margin-left: 24px;
    padding-left: 8px;
  }
  
  .comment-actions {
    flex-wrap: wrap;
  }
  
  .comment-item {
    padding: 8px 12px;
  }
}

/* 点赞动画效果 */
.v-btn[color="red"] {
  animation: heartbeat 0.3s ease-in-out;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 悬浮效果 */
.reply-content:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
}
</style>