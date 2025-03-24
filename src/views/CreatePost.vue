
<template>
    <v-container>
        <v-form @submit.prevent="savePost">
            <v-row>
                <v-col cols="8">
                    <v-text-field prepend-inner-icon="mdi-format-title" v-model="post.title" label="帖子标题" class="mt-5"
                        required></v-text-field>
                </v-col>
            </v-row>

            <v-row class="mt-0 pt-0">
                <v-col cols="4">
                    <v-text-field prepend-inner-icon="mdi-account" v-model="post.author" label="作者" class="mt-5"
                        required></v-text-field>
                </v-col>

                <v-col cols="4">
                    <v-select prepend-inner-icon="mdi-folder-outline" v-model="post.category" :items="categories"
                        label="选择分类" class="mt-5" required></v-select>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="8">
                    <v-combobox v-model="post.tags" :items="availableTags" label="添加标签"
                        prepend-inner-icon="mdi-tag-multiple" multiple chips small-chips deletable-chips
                        hint="可添加多个标签，按回车确认" persistent-hint></v-combobox>
                </v-col>
            </v-row>

            <v-row class="mt-4">
                <v-col cols="12">
                    <v-file-input v-model="images" counter label="上传图片" multiple prepend-icon="mdi-camera" show-size
                        accept="image/*" :rules="[v => !v || v.length <= 5 || '最多上传5张图片']"
                        @change="previewImages"></v-file-input>
                </v-col>
            </v-row>

            <v-row v-if="imagePreviewUrls.length > 0" class="mt-2">
                <v-col cols="12">
                    <div class="d-flex flex-wrap">
                        <v-card v-for="(url, index) in imagePreviewUrls" :key="index" class="ma-2" width="150"
                            height="150">
                            <v-img :src="url" height="120" contain></v-img>
                            <v-card-actions class="pa-0 justify-center">
                                <v-btn icon small color="error" @click="removeImage(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </div>
                </v-col>
            </v-row>

            <v-row class="mt-4">
                <v-col cols="12">
                    <v-card outlined>
                        <v-card-title class="text-subtitle-1 grey lighten-4">
                            <v-icon left>mdi-pencil</v-icon>
                            帖子内容
                        </v-card-title>
                        <v-card-text>
                            <ckeditor :editor="editor" v-model="post.content" :config="editorConfig"></ckeditor>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-4">
                <v-col class="d-flex">
                    <v-btn type="submit" color="indigo" rounded class="font-weight-bold" dark @click="savePost">
                        <v-icon left>mdi-cloud-upload</v-icon>
                        发布帖子
                    </v-btn>
                    <v-btn class="ml-4" outlined rounded color="grey" @click="resetForm">
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
            // 注册 CKEditor 组件
            ckeditor: CKEditor.component
        },
        data() {
            return {
                post: {
                    title: '',
                    content: '',
                    author: '',
                    category: '',
                    tags: [],
                    imageUrls: []
                },
                images: [],
                imagePreviewUrls: [],
                availableTags: [
                    '校园生活', '学习心得', '美食分享', '旅游攻略', '活动公告',
                    '考试经验', '社团活动', '运动健身', '校园风景', '文化交流'
                ],
                categories: [
                    '校园日常', '学术交流', '美食探店', '旅游分享', '活动通知',
                    '经验分享', '社团动态', '运动健康', '校园风采', '国际交流'
                ],
                editor: ClassicEditor,
                editorConfig: {
                    // CKEditor 配置项
                    placeholder: '在这里输入帖子内容...'
                }
            };
        },
        methods: {
            previewImages() {
                // 清空预览URL数组
                this.imagePreviewUrls = [];

                // 如果有选择文件，创建预览URL
                if (this.images && this.images.length) {
                    for (let i = 0; i < this.images.length; i++) {
                        const file = this.images[i];
                        const url = URL.createObjectURL(file);
                        this.imagePreviewUrls.push(url);
                    }
                }
            },
            removeImage(index) {
                // 从预览数组和文件数组中移除图片
                this.imagePreviewUrls.splice(index, 1);

                // 创建新的文件数组（因为v-file-input的值不能直接修改）
                const newFiles = Array.from(this.images);
                newFiles.splice(index, 1);
                this.images = newFiles.length ? newFiles : [];
            },
            savePost() {
                // 验证必填项
                if (!this.post.title || !this.post.author || !this.post.category || !this.post.content) {
                    alert('请填写所有必填项');
                    return;
                }

                // 处理图片上传（实际应用中需要将图片上传到服务器）
                // 这里仅做演示，实际项目中需要替换为真实的上传逻辑
                if (this.images.length) {
                    // 在实际应用中，这里应该有上传图片的代码
                    // 上传成功后会获取图片URL，存储在post.imageUrls中
                    this.post.imageUrls = this.imagePreviewUrls;
                }

                // 使用Vuex保存帖子数据
                // this.$store.commit('setPost', this.post);

                // 模拟API请求
                console.log('保存的帖子数据:', this.post);

                // 成功提示
                this.success();

                // 重置表单
                this.resetForm();
            },
            resetForm() {
                // 重置表单数据
                this.post = {
                    title: '',
                    content: '',
                    author: '',
                    category: '',
                    tags: [],
                    imageUrls: []
                };
                this.images = [];
                this.imagePreviewUrls = [];
            },
            success() {
                alert("帖子发布成功！");
            }
        }
    };
</script>

<style>
    .v-text-field__slot input {
        font-weight: 500;
    }

    .ck-editor__editable {
        min-height: 250px;
    }
</style>
