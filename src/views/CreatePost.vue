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
                    <v-file-input v-model="singleImage" counter label="选择单张图片" prepend-icon="mdi-camera" show-size
                        accept="image/*" @change="addSingleImage" hint="可多次添加不同图片，第一张图片将作为封面"
                        persistent-hint></v-file-input>
                </v-col>
            </v-row>

            <v-row v-if="imagePreviewUrls.length > 0" class="mt-2">
                <v-col cols="12">
                    <div class="d-flex align-center mb-2">
                        <v-chip color="indigo" text-color="white" small>
                            已上传 {{ imagePreviewUrls.length }} 张图片
                        </v-chip>
                        <span class="ml-2 caption">第一张图片将作为封面显示</span>
                    </div>
                    <div class="d-flex flex-wrap">
                        <v-card v-for="(url, index) in imagePreviewUrls" :key="index" class="ma-2" width="150"
                            height="150">
                            <v-img :src="url" height="120" contain></v-img>
                            <v-card-actions class="pa-0 justify-center">
                                <v-badge color="primary" dot v-if="index === 0">
                                    <span class="caption mr-2">封面</span>
                                </v-badge>
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
                    images: [],
                    coverImage: ''
                },
                singleImage: null,  // 新增：单张图片文件
                images: [],         // 所有已上传图片的集合
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
                this.images.splice(index, 1);
            },
            addSingleImage() {
                if (this.singleImage) {
                    // 限制最多5张图片
                    if (this.images.length >= 5) {
                        alert('最多只能上传5张图片');
                        this.singleImage = null;
                        return;
                    }

                    const formData = new FormData();
                    formData.append('file', this.singleImage);

                    this.$axios.post('/posts/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                    }).then(res => {
                    console.log("上传返回：", res);
                    const imageUrl = res.data.data; // 获取上传后的 URL

                    // 加入图片数组和预览
                    this.images.push(imageUrl);
                    this.imagePreviewUrls.push(imageUrl);

                    // 清空单图上传框，允许继续选择
                    this.singleImage = null;
                    }).catch(err => {
                    alert('图片上传失败');
                    console.error(err);
                    });
                }
            },
            savePost() {
                // 验证必填项
                if (!this.post.title || !this.post.author || !this.post.category || !this.post.content) {
                    alert('请填写所有必填项');
                    return;
                }

                // 处理图片上传
                if (this.images.length) {
                    this.post.images = [...this.images]; // 直接用上传后的 URL 列表
                    this.post.coverImage = this.images[0]; // 第一张作为封面
                }

                this.$axios.post('/posts', this.post)
                    .then(response => {
                    if (response.data.code === 200) {
                        alert("发布成功！");
                        this.resetForm();
                    } else {
                        alert("发布失败：" + response.data.message);
                    }
                    })
                    .catch(error => {
                    console.error("请求失败：", error);
                    alert("系统错误，发布失败！");
                    });

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
                    images: [],
                    coverImage: ''
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