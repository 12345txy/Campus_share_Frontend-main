<template>
  <v-container>
    <v-form @submit.prevent="saveAnnouncement">
      <!-- 描述词 -->
      <v-row>
        <v-col cols="8">
          <v-text-field 
            prepend-inner-icon="mdi-pencil" 
            v-model="description" 
            label="输入公告描述词" 
            class="mt-5" 
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- 生成标题和公告按钮 -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-btn color="primary" @click="generateContent">生成公告</v-btn>
        </v-col>
      </v-row>

      <!-- 公告标题 -->
      <v-row>
        <v-col cols="8">
          <v-text-field 
            prepend-inner-icon="mdi-format-title" 
            v-model="announcement.title" 
            label="公告标题" 
            class="mt-5" 
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- 公告正文 -->
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-title class="text-subtitle-1 grey lighten-4">
              <v-icon left>mdi-pencil</v-icon>
              公告正文
            </v-card-title>
            <v-card-text>
              <!-- 使用 CKEditor 编辑正文内容 -->
              <ckeditor 
                v-model="announcement.content" 
                :editor="editor" 
                :config="editorConfig"
              ></ckeditor>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 发布按钮 -->
      <v-row class="mt-4">
        <v-col class="d-flex">
          <v-btn 
            type="submit" 
            color="indigo" 
            rounded 
            class="font-weight-bold" 
            dark 
            @click="saveAnnouncement"
          >
            <v-icon left>mdi-cloud-upload</v-icon>
            发布公告
          </v-btn>
          <v-btn 
            class="ml-4" 
            outlined 
            rounded 
            color="grey" 
            @click="resetForm"
          >
            <v-icon left>mdi-refresh</v-icon>
            重置
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CKEditor from '@ckeditor/ckeditor5-vue2';

export default {
  components: {
    ckeditor: CKEditor.component // 注册 CKEditor 组件
  },
  data() {
    return {
      description: '',  // 用户输入的描述词
      announcement: {
        title: '',  // 公告标题
        content: '',  // 公告正文
        author: '校园印记开发者',  // 默认作者
        category: '',  // 分类（如果需要）
        tags: [],  // 标签（如果需要）
      },
      editor: ClassicEditor,  // 使用 ClassicEditor 编辑器
      editorConfig: {
        placeholder: '在这里输入公告内容...',
      }
    };
  },
  methods: {
    // 生成公告标题和内容
    async generateContent() {
      // 验证描述词是否为空
      if (!this.description.trim()) {
        alert('请输入公告描述词！');
        return;
      }

      // 调用 AI 接口生成公告内容
      const prompt = `请根据以下描述生成一个完整的公告：\n描述词：${this.description}`;

      try {
        const response = await this.fetchAIContent(prompt);
        this.announcement.title = response.title;  // 填充标题
        this.announcement.content = response.content;  // 填充正文
      } catch (error) {
        console.error("生成公告失败", error);
        alert('生成公告失败，请稍后再试。');
      }
    },

    async fetchAIContent(prompt) {
      try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 92362248034b4edd95d83a6db19d8a12.Y3keAMhdnh002Xrl',  // ✅ 智谱的 key
          },
          body: JSON.stringify({
            model: 'glm-4', // ✅ 或 glm-3-turbo，根据你有权限的模型
            messages: [
              {
                role: 'system',
                content: '你是一个校园公告撰写助手，请根据用户输入的描述生成公告，第一行为标题，其余为正文。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        const data = await response.json();

        if (data.error) {
          console.error('智谱 AI 错误：', data.error);
          throw new Error(data.error.message || 'AI 请求失败');
        }

        const text = data.choices[0].message.content.trim();
        const lines = text.split('\n');
        return {
          title: lines[0],
          content: lines.slice(1).join('\n')
        };
      } catch (error) {
        console.error("请求智谱 AI 接口失败", error);
        throw new Error('AI 请求失败');
      }
    },



    // 保存公告
    saveAnnouncement() {
      // 验证公告标题和内容
      if (!this.announcement.title.trim() || !this.announcement.content.trim()) {
        alert('请填写所有必填项');
        return;
      }
      this.saveContent();
    },

    saveContent() {
    // 确保已经填写标题和内容
    const postData = {
        title: this.announcement.title,
        content: this.announcement.content
    };

    const token = localStorage.getItem('token');  // 获取 token

    // 使用 axios 向后端发送公告数据
    this.$axios.post('/admin/system/announcements/create', postData,{
         headers: {
            'Authorization': `Bearer ${token}`  // 将 token 添加到请求头
        },
        withCredentials: true
        })
        .then(response => {
        console.log('公告发布成功：', response.data);
        alert('公告发布成功！');
        this.resetForm();
        })
        .catch(error => {
        console.error('公告发布失败：', error);
        alert('发布失败，请重试！');
        });
    },

    // 重置表单
    resetForm() {
      this.announcement = {
        title: '',
        content: '',
        author: '校园印记开发者',  // 保持默认值
        category: '',
        tags: [],
      };
      this.description = '';  // 清空描述词
    }
  }
};
</script>

<style scoped>
.v-text-field__slot input {
  font-weight: 500;
}

.ck-editor__editable {
  min-height: 250px;
}
</style>
