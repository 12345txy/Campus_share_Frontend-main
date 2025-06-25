<template>
  <div class="comment-wrapper">
    <!-- 主评论 -->
    <v-list-item class="main-comment">
      <v-list-item-avatar size="48">
        <v-img :src="comment.avatar || comment.authorAvatar || defaultAvatar"></v-img>
      </v-list-item-avatar>
      
      <v-list-item-content>
        <v-list-item-title class="font-weight-bold text-h6">
          {{ comment.nickname || comment.authorName || '匿名用户' }}
        </v-list-item-title>
        <v-list-item-subtitle class="main-comment-content mt-2">
          {{ comment.content }}
        </v-list-item-subtitle>
        <div class="d-flex align-center mt-3">
          <span class="caption grey--text text--darken-1 mr-4">
            {{ formatTime(comment.createTime) }}
          </span>
          
          <div class="comment-actions d-flex align-center flex-wrap">
            <v-btn small text color="primary" class="mr-3" @click="prepareReply(comment)">
              <v-icon small left>mdi-reply</v-icon>
              回复
            </v-btn>
            
            <div class="d-flex align-center mr-4">
              <v-btn 
                icon 
                small 
                :color="comment.isLiked ? 'indigo' : 'grey'" 
                class="mr-1" 
                @click.stop="toggleCommentLike(comment, $event)"
              >
                <v-icon>{{ comment.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
              </v-btn>
              <span class="body-2">{{ comment.likeCount || 0 }}</span>
            </div>
            
            <div v-if="comment.replyCount > 0" class="d-flex align-center">
              <v-btn 
                small 
                text 
                color="blue" 
                class="mr-1"
                @click="toggleShowReplies(comment)"
              >
                <v-icon small left>mdi-message-reply-outline</v-icon>
                {{ comment.showReplies ? '收起回复' : '查看回复' }}
              </v-btn>
              <span class="body-2">{{ comment.replyCount || 0 }}</span>
            </div>
          </div>
        </div>
      </v-list-item-content>
    </v-list-item>
    
    <!-- 子评论区域 -->
    <div v-if="comment.showReplies && comment.replies && comment.replies.length" class="replies-container">
      <div v-for="reply in comment.replies" :key="reply.id" class="reply-wrapper">
        <v-list-item class="sub-comment">
          <v-list-item-avatar size="32">
            <v-img :src="reply.avatar || reply.authorAvatar || defaultAvatar"></v-img>
          </v-list-item-avatar>
          
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium text-body-1">
              {{ reply.nickname || reply.authorName || '匿名用户' }}
            </v-list-item-title>
            <v-list-item-subtitle class="sub-comment-content mt-1">
              {{ reply.content }}
            </v-list-item-subtitle>
            <div class="d-flex align-center mt-2">
              <span class="caption grey--text mr-3">
                {{ formatTime(reply.createTime) }}
              </span>
              
              <div class="comment-actions d-flex align-center">
                <v-btn x-small text color="primary" class="mr-2" @click="prepareReply(reply)">
                  <v-icon x-small left>mdi-reply</v-icon>
                  回复
                </v-btn>
                
                <div class="d-flex align-center">
                  <v-btn 
                    icon 
                    x-small 
                    :color="reply.isLiked ? 'indigo' : 'grey'" 
                    class="mr-1" 
                    @click.stop="toggleCommentLike(reply, $event)"
                  >
                    <v-icon x-small>{{ reply.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                  </v-btn>
                  <span class="caption">{{ reply.likeCount || 0 }}</span>
                </div>
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
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
        
        if (diff < 60000) {
          return '刚刚';
        }
        else if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          return `${minutes}分钟前`;
        }
        else if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000);
          return `${hours}小时前`;
        }
        else if (diff < 604800000) {
          const days = Math.floor(diff / 86400000);
          return `${days}天前`;
        }
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
  margin-bottom: 16px;
}

/* 主评论样式 */
.main-comment {
  background-color: #ffffff;
  padding: 20px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
}

.main-comment-content {
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 1rem;
  color: #333;
  font-weight: 400;
}

/* 子评论容器 */
.replies-container {
  margin-left: 32px;
  margin-top: 8px;
}

.reply-wrapper {
  margin-bottom: 8px;
}

/* 子评论样式 - 明显更小更紧凑 */
.sub-comment {
  background-color: #f8f9fa;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.sub-comment-content {
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 0.875rem;
  color: #555;
}

/* 按钮大小区别 */
.main-comment .v-btn--small {
  height: 32px;
  min-width: 64px;
  font-size: 0.875rem;
}

.sub-comment .v-btn--x-small {
  height: 24px;
  min-width: 48px;
  font-size: 0.75rem;
  padding: 0 8px !important;
}

/* 头像大小已通过size属性控制 */
.main-comment .v-avatar {
  margin-right: 16px;
}

.sub-comment .v-avatar {
  margin-right: 12px;
}

/* 字体大小层次 */
.main-comment .v-list-item__title {
  font-size: 1.1rem;
  color: #1976d2;
}

.sub-comment .v-list-item__title {
  font-size: 0.9rem;
  color: #424242;
}

/* 操作按钮区域 */
.comment-actions {
  gap: 8px;
  flex-direction: row !important;
  align-items: center !important;
}

/* 悬浮效果 */
.main-comment:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.sub-comment:hover {
  background-color: #f0f1f2;
  transition: background-color 0.2s ease;
}

/* 点赞动画效果 */
.v-btn[color*="indigo"] .v-icon {
  color: #1976d2 !important;
  animation: likeAnimation 0.3s ease;
}

@keyframes likeAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .replies-container {
    margin-left: 16px;
  }
  
  .main-comment {
    padding: 16px 12px;
  }
  
  .sub-comment {
    padding: 10px 12px;
  }
  
  .comment-actions {
    flex-wrap: wrap;
  }
}
</style>