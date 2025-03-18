<template>
    <v-container>
        <v-form @submit.prevent="saveDiary">
        <v-row>
            <v-col cols="8"> <!-- 设置 cols 为 "8" -->
                <v-text-field prepend-inner-icon="mdi-pencil" v-model="diary.title" label="日记标题" class="mt-5" required></v-text-field>
            </v-col>
        </v-row>
        <v-row class="mt-0 pt-0">
            <v-col cols="4"> <!-- 设置 cols 为 "8" -->
                <v-text-field prepend-inner-icon="mdi-account" v-model="diary.author" label="作者" class="mt-5" required></v-text-field>
            </v-col>
            <v-col cols="4"> <!-- 设置 cols 为 "8" -->
                <v-text-field prepend-inner-icon="mdi-map-marker" v-model="diary.location" label="游学地点" class="mt-5" required></v-text-field>
            </v-col>
        </v-row>
                <ckeditor :editor="editor" v-model="diary.content" :config="editorConfig"></ckeditor>
                <v-btn type="submit" color="indigo" rounded class="mt-5 font-weight-bold" dark @click=saveDiary>保存日记</v-btn>
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
                diary: {
                    title: '',
                    content: '',
                    author:'',
                    location:'',
                },
                editor: ClassicEditor,
                editorConfig: {
                    // CKEditor 配置项
                }
            };
        },
        methods: {
        saveDiary() {
      // 使用Vuex mutation来保存日记
        this.$store.commit('setDiary', this.diary);
        this.success();
        },
        success(){
                alert("日记保存成功！");
        }
        },
    };
</script>