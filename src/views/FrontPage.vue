<template>
    <v-app>
        <v-container>
            <!-- 种类选择（Category）筛选 -->
            <v-tabs v-model="selectedCategoryIndex" background-color="transparent" color="indigo"
                slider-color="indigo accent-4" centered show-arrows>
                <v-tab v-for="category in categories" :key="category"
                    class="font-weight-bold text-body-1" @click="fetchPosts(category)">
                    {{ category }}
                </v-tab>
            </v-tabs>
            <!-- 搜索部分 -->
            <v-container d-flex class="pb-0" >
                <v-btn rounded class="mr-2 font-weight-black" color="indigo" dark @click="toggleSearchMode">
                    <v-icon left>
                        {{ searchIcon }}
                    </v-icon>
                    {{ searchText }}
                </v-btn>
                <div style="position: relative; width: 80%; display: flex;">
                    <v-menu offset-y v-model="displayResults" nudge-top="20" :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="searchContent" :label="searchPlaceholder" 
                            append-icon="mdi-magnify"  @click:append="onSearchClick" v-bind="attrs" clearable v-on="on" outlined dense style="width: 100%;" ref="searchIcon">
                                <!-- 添加清除按钮点击事件 -->
                                <template #append-inner>
                                    <v-icon v-if="searchContent" @click="clearSearch">mdi-close</v-icon>
                                </template>
                            </v-text-field>
                        </template>
                        <v-list>
                            <v-list-item @click="selectPost(post)" style="width: 100%;" v-for="post in searchResults"
                                         :key="post.id" dense>
                                <v-icon class="mr-3">{{ getPostIcon(post) }}</v-icon>
                                <v-list-item-title class="font-weight-bold text--secondary mr-4">
                                    <v-row align="center" justify="space-between">
                                        <v-col cols="auto">{{ post.title }}</v-col>
                                        <v-col cols="auto">
                                            <v-icon small class="mr-1">mdi-thumb-up</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary text-caption mr-2">
                                                {{ post.likeCount || 0 }}
                                            </span>
                                            <v-icon small class="mr-1" color="red">mdi-heart</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary text-caption mr-2">
                                                {{ post.likes }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-list-item-title>
                                <v-list-item-subtitle
                                        v-html="highlightSearchQuery(post.content)"></v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <!-- 修改搜索控制按钮，使其与搜索框对齐 -->
                    <v-btn 
                        @click="toggleSearchStatus" 
                        class="ml-2 " 
                        outlined 
                        dense
                        :color="isSearching ? 'indigo' : 'grey'"
                        :style="{ height: '40px' }">
                        <v-icon left small>
                            {{ isSearching ? 'mdi-loading mdi-spin' : 'mdi-magnify' }}
                        </v-icon>
                        {{ isSearching ? '搜索中' : '开始搜索' }}
                    </v-btn>
                </div>
            </v-container>
            <!-- 标签筛选 -->
            <v-container class="pt-0 pb-2">
                <div class="d-flex justify-center">
                    <v-chip-group active-class="primary--text" column multiple>
                        <v-chip v-for="tag in popularTags" :key="tag" :input-value="selectedTags.includes(tag)"
                            @click="toggleTag(tag)" filter outlined>
                            #{{ tag }}
                        </v-chip>
                    </v-chip-group>
                </div>
            </v-container>

            <!-- 排序选项 -->
            <v-container pt-0>
                <v-chip-group column active-class="indigo--text" v-model="sortOption">
                    <v-chip filter outlined>最新</v-chip>
                    <v-chip filter outlined>热门</v-chip>
                    <v-chip filter outlined>推荐</v-chip>
                </v-chip-group>

                <!-- 帖子卡片展示 -->
                <v-container>
                    <v-row>
                        <v-col v-for="post in posts" :key="post.id" cols="12" sm="6" md="4">
                            <v-card class="mx-auto" max-width="400" hover @click="openPostDetail(post)">
                                <!-- 轮播图或单图容器 -->
                                <div class="carousel-container" style="position: relative;">
                                    <template v-if="post.images && post.images.length > 1">
                                        <v-carousel height="200" :show-arrows="true" hide-delimiter-background
                                            :hide-delimiters="false" show-arrows-on-hover>
                                            <v-carousel-item v-for="(image, i) in post.images" :key="i" :src="image"
                                                cover></v-carousel-item>
                                        </v-carousel>
                                    </template>

                                    <!-- 单图显示 -->
                                    <v-img v-else :src="post.coverImage || (post.images && post.images[0])" height="200"
                                        class="white--text align-end">
                                    </v-img>

                                    <!-- 固定位置的标题覆盖层，不管是轮播还是单图都显示 -->
                                    <div class="carousel-title-overlay">
                                        <span class="text-h6 white--text">{{ post.title }}</span>
                                    </div>
                                </div>

                                <v-card-text class="content-preview">
                                    {{ stripHtmlTags(post.content).slice(0, 50) + (stripHtmlTags(post.content).length > 50 ? '...' : '') }}

                                </v-card-text>

                                <!-- 标签展示 -->
                                <v-card-text class="py-0" v-if="post.tags && post.tags.length">
                                    <v-chip x-small class="mr-1 mb-1" v-for="tag in post.tags.slice(0, 3)" :key="tag"
                                        color="indigo" text-color="white">
                                        #{{ tag }}
                                    </v-chip>
                                    <span v-if="post.tags.length > 3" class="caption">+{{ post.tags.length - 3 }}</span>
                                </v-card-text>

                                <v-card-text class="text--primary py-2">
                                    <div class="d-flex align-center">
                                        <v-avatar size="30">
                                            <img :src="post.authorAvatar" alt="avatar" @error="handleImageError" @click="goToUserProfile(post.userId)">
                                        </v-avatar>
                                        <span class="ml-1 caption">{{ post.authorName }}</span>
                                        <v-btn outlined x-small dark :color="post.isFollowing ? 'grey' : 'indigo'"
                                            @click.stop="toggleFollow(post, $event)" class="follow-btn ml-2">
                                            <v-icon class="mr-0" x-small left>{{ post.isFollowing ? 'mdi-account-minus' :
                                                'mdi-account-plus' }}</v-icon>
                                            {{ post.isFollowing ? '已关注' : '关注' }}
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                        <div class="d-flex align-center">
                                            <!-- 点赞按钮 -->
                                            <v-btn icon x-small color="indigo" class="mr-1 like-btn"
                                                @click.stop="toggleLike(post, $event)"
                                                :class="{'pulse-animation': post.isLiked}">
                                                <v-icon small>{{ post.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'
                                                    }}</v-icon>
                                            </v-btn>
                                            <span class="mr-1 caption like-count-text"
                                                :class="{'primary--text': post.isLiked}">{{ post.likes }}</span>

                                            <!-- 收藏按钮 -->
                                            <v-btn icon x-small color="red" class="mr-1 favorite-btn"
                                                @click.stop="toggleFavorite(post, $event)"
                                                :class="{'pulse-animation': post.isFavorite}">
                                                <v-icon small>{{ post.isFavorite ? 'mdi-heart' : 'mdi-heart-outline'
                                                    }}</v-icon>
                                            </v-btn>
                                            <span class="mr-1 caption favorite-count-text"
                                                :class="{'red--text': post.isFavorite}">{{ post.likeCount || 0 }}</span>

                                            <!-- 评论按钮 -->
                                            <v-btn icon x-small class="mr-1" @click.stop="openComments(post, $event)">
                                                <v-icon color="blue" small>mdi-comment-outline</v-icon>
                                            </v-btn>
                                            <span class="mr-1 caption">{{ post.comments || 0 }}</span>
                                             <!-- 查看数 -->
                                            <v-btn icon x-small class="mr-1" disabled>
                                                <v-icon color="grey" small>mdi-eye</v-icon>
                                            </v-btn>
                                            <span class="mr-1 caption">{{ post.views || 0 }}</span>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>

            <!-- 添加帖子按钮 -->
            <router-link to="/CreatePost">
                <v-btn class="fixed-button" large color="indigo" dark fab>
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </router-link>

            <!-- 评论对话框 -->
            <v-dialog v-model="commentDialog" max-width="600px">
                <v-card v-if="selectedPost">
                    <v-card-title>
                        评论 - {{ selectedPost.title }}
                        <v-spacer></v-spacer>
                        <v-btn icon @click="commentDialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="comments-container">
                        <v-list two-line>
                            <template v-for="(comment, index) in comments">
                                <CommentItem :comment="comment" :toggleShowReplies="toggleShowReplies" :prepareReply="prepareReply" :toggleCommentLike="toggleCommentLike" :key="comment.id || 'comment-' + index" />
                            </template>

                            <v-list-item v-if="comments.length === 0">
                                <v-list-item-content class="text-center">
                                    <v-list-item-title>暂无评论</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                    <v-divider></v-divider>
                    
                    <v-card-actions>
                        <v-text-field v-model="newComment" 
                            :label="replyingTo ? `回复 ${replyingTo.nickname || replyingTo.authorName || '匿名用户'}` : '添加评论'"
                            outlined dense :append-icon="replyingTo ? 'mdi-close' : 'mdi-send'"
                            :append-icon-cb="replyingTo ? cancelReply : null"
                            @click:append="replyingTo ? cancelReply() : addComment()" @keyup.enter="addComment">
                            <template v-slot:append>
                                <v-icon v-if="replyingTo" color="grey" class="mr-2" @click="cancelReply">
                                    mdi-close
                                </v-icon>
                                <v-icon color="primary" @click="addComment">
                                    mdi-send
                                </v-icon>
                            </template>
                        </v-text-field>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            
            <v-dialog v-model="announcementDialog" max-width="600">
                <v-card>
                    <v-card-title class="headline">{{ newAnnouncement.title }}</v-card-title>
                    <v-card-text v-html="newAnnouncement.content"></v-card-text>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="announcementDialog = false">关闭</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>


            <!-- 帖子详情对话框 -->
            <v-dialog v-model="postDetailDialog" max-width="700">
                <v-card v-if="selectedPost" class="pa-0">
                    <!-- 直接使用与列表完全相同的帖子卡片结构，只移除高度限制 -->
                    <v-card flat class="post-detail">
                        <!-- 帖子头部信息 -->
                        <v-card-title class="pb-1">
                            <v-row align="center" class="mx-0">
                                <v-avatar size="40">
                                    <img :src="selectedPost.authorAvatar" alt="avatar" @error="handleImageError" @click="goToUserProfile(post.userId)">
                                </v-avatar>
                                <div class="ml-3">
                                    <div class="subtitle-1 font-weight-medium">{{ selectedPost.authorName }}</div>
                                    <div class="caption text--secondary">{{ selectedPost.createTime }}</div>
                                </div>
                                <v-spacer></v-spacer>
                                <!-- 添加关注按钮 -->
                                <v-btn small outlined :color="selectedPost.isFollowing ? 'grey' : 'indigo'"
                                    @click.stop="toggleFollow(selectedPost)" class="follow-btn">
                                    <v-icon small left>{{ selectedPost.isFollowing ? 'mdi-account-minus' :
                                        'mdi-account-plus' }}</v-icon>
                                    {{ selectedPost.isFollowing ? '已关注' : '关注' }}
                                </v-btn>
                            </v-row>
                        </v-card-title>

                        <!-- 帖子标题 -->
                        <v-card-title class="pt-0 pb-2 pt-4 text-h6">
                            {{ selectedPost.title }}
                        </v-card-title>

                        <!-- 帖子内容 - 无高度限制 -->
                        <v-card-text>
                            <div class="body-1 content-preview">{{ selectedPost.content }}</div>
                        </v-card-text>

                        <!-- 帖子图片 -->
                        <v-card-text
                            v-if="selectedPost.coverImage || (selectedPost.images && selectedPost.images.length > 0)"
                            class="pt-0">
                            <!-- 单张图片 - 处理coverImage或images[0]情况 -->
                            <v-img v-if="!selectedPost.images || selectedPost.images.length <= 1"
                                :src="selectedPost.coverImage || (selectedPost.images && selectedPost.images[0])"
                                max-height="300" contain class="rounded-lg"></v-img>

                            <!-- 多张图片网格 -->
                            <v-row v-else dense>
                                <v-col v-for="(image, index) in selectedPost.images" :key="index" cols="4">
                                    <v-img :src="image" aspect-ratio="1" class="rounded"></v-img>
                                </v-col>
                            </v-row>
                        </v-card-text>

                        <!-- 标签和分类 -->
                        <v-card-text class="py-1">
                            <v-chip v-for="tag in selectedPost.tags" :key="tag" small class="mr-1" color="indigo"
                                text-color="white">
                                #{{ tag }}
                            </v-chip>
                        </v-card-text>

                        <!-- 互动按钮 - 保持原有的图标和事件处理 -->
                        <v-card-actions>
                            <!-- 使用原始点赞图标 mdi-thumb-up -->
                            <v-btn text @click.stop="toggleLike(selectedPost, $event)" class="like-btn">
                                <v-icon color="indigo">
                                    {{ selectedPost.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}
                                </v-icon>
                                <span class="ml-1 like-count-text">
                                    {{ selectedPost.likes || 0 }}
                                </span>
                            </v-btn>
                            <!-- 收藏按钮 -->
                            <v-btn text @click.stop="toggleFavorite(selectedPost, $event)" class="favorite-btn">
                                <v-icon color="red">
                                    {{ selectedPost.isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                                </v-icon>
                                <span class="ml-1 favorite-count-text">
                                    {{ selectedPost.likeCount || 0 }}
                                </span>
                            </v-btn>


                            <!-- 评论按钮 -->
                            <v-btn text @click.native.stop="openComments(selectedPost, $event)" class="mr-2">
                                <v-icon color="blue">mdi-comment-outline</v-icon>
                                <span class="ml-1">{{ selectedPost.comments || 0 }}</span>
                            </v-btn>


                            <v-spacer></v-spacer>

                            <v-btn color="primary" text @click="postDetailDialog = false">
                                关闭
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-card>
            </v-dialog>
            
        </v-container>
        <v-container pt-0>
    
    <!-- 帖子卡片展示 -->
    <v-container>
        <v-row>
            <v-col v-for="post in posts" :key="post.id" cols="12" sm="6" md="4">
                <!-- 帖子卡片内容... -->
            </v-col>
        </v-row>
    </v-container>

    
</v-container>
 <!-- 分页组件 -->
 <v-pagination
        v-model="currentPage"
        :length="totalPages"
        @input="onPageChange"></v-pagination>
       </v-app>
    
</template>

<script>
import axios from 'axios';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Vue from 'vue';
    // 根据帖子类别返回不同图标
    const categoryIcons = {
                        '旅游': 'mdi-airplane',
                        '美食': 'mdi-food',
                        '学习': 'mdi-book-open-page-variant',
                        '校园': 'mdi-school',
                        '生活': 'mdi-home',
                        '情感': 'mdi-heart',
                        '科技': 'mdi-laptop',
                        '娱乐': 'mdi-movie',
                        '体育': 'mdi-basketball'
                    };
    export default {
        data: () => ({
            announcementDialog: false,
            newAnnouncement: {
            title: '',
            content: ''
            },
            stompClient: null,

            // 搜索相关
            searchMode: 0, // 0: 内容搜索, 1: 用户搜索
            searchContent: '',
            searchResults: [],
            displayResults: false,

            // 分类相关
            selectedCategory: '全部',
            selectedCategoryIndex: 0, // 新增：用于v-tabs绑定的索引
            categories: ['全部', '旅游', '美食', '学习', '校园', '生活', '情感', '科技', '娱乐', '体育'],

            // 标签相关
            selectedTags: [],
            popularTags: [],

            // 排序方式
            sortOption: 0, // 0: 最新, 1: 热门, 2: 推荐

            // 帖子数据
            posts: [],
            currentPage: 1,
            pageSize: 6,
            totalPages: 1,
            // 评论相关
            commentDialog: false,
            selectedPost: null,
            comments: [],
            newComment: '',
            replyingTo: null,  // 当前回复的评论对象
            replyParentId: null, // 如果是回复嵌套评论，记录父评论ID
            token: localStorage.getItem('token') || '' ,
            // 用户信息
            currentUser: {
                id: 1,
                avatar: 'https://cdn.vuetifyjs.com/images/john.jpg'
            },

            postDetailDialog: false,  // 控制帖子详情对话框的显示
            isSearching: false // 新增全局变量，标记是否处于搜索状态
        }),

        computed: {
            paginatedPosts() {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            return this.posts.slice(startIndex, endIndex);
        },
            searchIcon() {
                switch (this.searchMode) {
                    case 0: return 'mdi-file-search';
                    case 1: return 'mdi-account-search';
                    default: return 'mdi-magnify';
                }
            },
            searchText() {
                switch (this.searchMode) {
                    case 0: return '搜内容';
                    case 1: return '搜用户';
                    default: return '搜索';
                }
            },
            searchPlaceholder() {
                switch (this.searchMode) {
                    case 0: return '搜索帖子标题和内容';
                    case 1: return '搜索用户名';
                    default: return '搜索';
                }
            }
        },
        mounted() {
            this.connectAnnouncementWebSocket();
        },
        methods: {
            connectAnnouncementWebSocket() {
                const socket = new SockJS('http://localhost:8080/ws');
                const stompClient = Stomp.Stomp.over(socket);

                stompClient.connect({}, frame => {
                    console.log('✅ WebSocket 连接成功:', frame);
                    stompClient.subscribe('/topic/announcements', message => {
                    const data = JSON.parse(message.body);
                    this.newAnnouncement = {
                        title: data.title,
                        content: data.content
                    };
                    this.announcementDialog = true;
                    });
                }, error => {
                    console.error('❌ WebSocket 连接失败:', error);
                });
                this.stompClient = stompClient;
            },
            goToUserProfile(userId) {
                // 修改路由跳转，传递 userId 参数
                this.$router.push({ name: 'UserProfile', params: { userId: userId } });
            },

            toggleSearchMode() {
                this.searchMode = (this.searchMode + 1) % 2;
                this.searchContent = '';
                this.searchResults = [];
            },

            // 新功能
            stripHtmlTags(text) {
                return text ? text.replace(/<[^>]+>/g, '') : '暂无内容';
            },
          /*  
            search() {
    if (!this.searchContent.trim()) {
        this.searchResults = [];
        return;
    }
    if (this.searchMode === 1) { // 用户搜索模式
        // 先获取前6条数据
        this.$axios.get(`/api/posts/user/${this.searchContent}?current=1&size=6`)
           .then(response => {
                if (response.data.code === 200) {
                    this.tempSearchResults = response.data.data.records; // 暂存前6条结果
                    this.searchResults = this.tempSearchResults; // 先展示这6条
                }
            })
           .catch(error => {
                console.error('搜索失败:', error);
                // 模拟搜索结果
                this.tempSearchResults = this.posts.filter(post => {
                    return post.authorName.includes(this.searchContent);
                }).slice(0, 6);
                this.searchResults = this.tempSearchResults;
            });
        // 点击放大镜时获取全部结果
        this.$refs.searchIcon.addEventListener('click', () => {
            this.$axios.get(`/api/posts/user/${this.searchContent}`)
               .then(response => {
                    if (response.data.code === 200) {
                        this.searchResults = response.data.data.records; // 替换为全部结果
                    }
                })
               .catch(error => {
                    console.error('搜索失败:', error);
                    this.searchResults = this.posts.filter(post => {
                        return post.authorName.includes(this.searchContent);
                    });
                });
        });
    } else {
        // 其他搜索模式（内容搜索等）
        this.$axios.post('/api/posts/search', {
            mode: this.searchMode,
            query: this.searchContent,
            category: this.selectedCategory!== '全部'? this.selectedCategory : '',
            tags: this.selectedTags
        })
           .then(response => {
                if (response.data.code === 200) {
                    this.searchResults = response.data.data;
                }
            })
           .catch(error => {
                console.error('搜索失败:', error);
                if (this.searchMode === 0) {
                    // 内容搜索
                    this.searchResults = this.posts.filter(post => {
                        return post.title.includes(this.searchContent) ||
                            post.content.includes(this.searchContent);
                    });
                } else {
                    // 标签搜索（虽已去除标签搜索，但保留逻辑完整性）
                    this.searchResults = this.posts.filter(post => {
                        return post.tags && post.tags.some(tag => tag.includes(this.searchContent));
                    });
                }
            });
    }
},*/
            getPostIcon(post) {
                

                return categoryIcons[post.category-1] || 'mdi-text-box';
            },

            highlightSearchQuery(text) {
                if (!this.searchContent || !text) return text;

                const regex = new RegExp(`(${this.searchContent})`, 'gi');
                return text.substring(0, 100).replace(regex, '<span class="highlight">$1</span>') +
                    (text.length > 100 ? '...' : '');
            },

            toggleTag(tag) {
                const index = this.selectedTags.indexOf(tag);
                if (index === -1) {
                    this.selectedTags.push(tag);
                } else {
                    this.selectedTags.splice(index, 1);
                }
               this.fetchPosts();
            },

            selectPost(post) {
                // 跳转到帖子详情页
                this.$router.push(`/posts/${post.id}`);
            },
            onPageChange(newPage) {
                this.currentPage = newPage;
                this.fetchPosts(); // 重新获取对应页码的数据
            },
            fetchPosts(category) {

                if(category!=null){
                this.selectedCategory=category;}
                const categoryNames = Object.keys(categoryIcons);
                console.log('点击页数为:', this.currentPage);
                // 从本地存储中获取 token
                const token = localStorage.getItem('token');
                
                // 从后端获取帖子列表
                let params;
                let url;
            if (this.isSearching) {
                // 搜索状态下使用搜索接口
                if(this.searchMode==1){
                    url = `/posts/user/${-1}`;
                    params = {
                        sortOption:this.sortOption,
                        userName:this.searchContent,
                        current: this.currentPage,
                        size: this.pageSize,
                        tags: this.selectedTags.map(tag => encodeURIComponent(tag)).join(',')  // 对标签进行编码
                    };
                }
                else if(this.searchMode==0){
                    // 正常状态下使用原接口
                    url = `/posts/search`;
                    params = {
                        keyword:this.searchContent,
                        current: this.currentPage,
                        size: this.pageSize,
                        sortOption:this.sortOption,
                        tags:this.selectedTags.map(tag => encodeURIComponent(tag)).join(',') // 对标签进行编码
                    };
                }
            }
            else{
                url = '/posts';
                params = {
                    sortOption:this.sortOption,
                    current: this.currentPage,
                    size: this.pageSize,
                    tags:this.selectedTags.map(tag => encodeURIComponent(tag)).join(',')  // 对标签进行编码
                };
                console.log('选择标签:', this.selectedTags.map(tag => encodeURIComponent(tag)).join(',') ); // 对标签进行编码
                if (this.selectedCategory !== '全部') {
                    // 找到 selectedCategory 在 categoryNames 中的索引
                    const categoryIndex = categoryNames.indexOf(this.selectedCategory);
                    if (categoryIndex !== -1) {
                        const categoryId = categoryIndex + 1;
                        url = `/posts/category/${categoryId}`;
                        // 移除 category 参数，因为后端接口通过路径参数接收 categoryId
                        console.log('选择种类:',  categoryId);
                    }
                } 
            }

    // 从后端获取帖子列表
    this.$axios.get(url, {
        params,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
   
      .then(response => {
        
            if (response.data.code === 200) {
                // 确保初始化所有状态字段
                this.posts = response.data.data.list.map(post => {
                    const categoryName = categoryNames[post.categoryId - 1];
                    return {
                        id: post.id,
                                title: post.title,
                                userId:post.userId,
                                content: post.content,
                                coverImage: post.coverImage,
                                images: post.images,
                                authorName: post.userNickname,
                                authorAvatar: post.userAvatarUrl,
                                category: categoryName,
                                tags: post.tags,
                                likes: post.likeCount,
                                likeCount: post.favoriteCount,
                                comments:post.commentCount,
                                views:post.viewCount,
                                isFavorite: post.favorite,
                                isLiked: post.liked,

                                createTime: post.createTime,
                                isFollowing:post.following
                    };
                });
                this.totalPages = response.data.data.pages;
            }
        })
                    .catch(error => {
                        console.error('获取帖子列表失败:', error);
                        // 模拟数据
                        this.posts = [
                            {
                                id: 1,
                                title: '杭州西湖一日游',
                                content: '杭州西湖是中国著名的旅游景点，我在这里度过了愉快的一天。湖水清澈，景色优美，特别推荐断桥和雷峰塔。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
                                images: ['https://cdn.vuetifyjs.com/images/cards/sunshine.jpg', 'https://cdn.vuetifyjs.com/images/cards/house.jpg', 'https://cdn.vuetifyjs.com/images/cards/road.jpg', 'https://cdn.vuetifyjs.com/images/cards/cooking.png', 'https://cdn.vuetifyjs.com/images/cards/docks.jpg', 'https://cdn.vuetifyjs.com/images/cards/hotel.jpg'],
                                authorName: '旅行达人',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                                category: '旅游',
                                tags: ['旅行', '杭州', '西湖'],
                                likes: 42,
                                likeCount: 53,
                                comments: 8,
                                views:1,
                                isFavorite: false,
                                isLiked: false,

                                createTime: '2023-12-01 15:30',
                                isFollowing: false
                            },
                            {
                                id: 2,
                                title: '上海外滩夜景',
                                content: '上海外滩的夜景非常壮观，东方明珠和各种高楼大厦的灯光映照在黄浦江上，美不胜收。推荐傍晚时分前往，可以同时欣赏日落和夜景。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/road.jpg',
                                authorName: '摄影爱好者',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/ben.jpg',
                                category: '旅游',
                                tags: ['旅行', '上海', '夜景', '摄影'],
                                likes: 36,
                                likeCount: 48,
                                comments: 5,
                                views:1,
                                isFavorite: true,
                                isLiked: false,
                                createTime: '2023-11-28 20:15',
                                isFollowing: false
                            },
                            {
                                id: 3,
                                title: '北京故宫博物院',
                                content: '北京故宫是中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一，也是中国古代宫廷建筑之精华。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/house.jpg',
                                authorName: '历史研究者',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/marcus.jpg',
                                category: '旅游',
                                tags: ['旅行', '北京', '故宫', '历史'],
                                likes: 128,
                                likeCount: 86,
                                views:1,
                                comments: 42,
                                isFavorite: true,
                                isLiked: false,
                                createTime: '2023-11-25 10:45',
                                isFollowing: false
                            },
                            {
                                id: 4,
                                title: '成都美食攻略',
                                content: '成都作为美食之都，有着丰富多彩的美食文化。这里推荐几家必吃的地道川菜馆，让你体验正宗川菜的麻辣鲜香。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
                                authorName: '美食家',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/mary.jpg',
                                category: '美食',
                                tags: ['美食', '成都', '川菜'],
                                likes: 96,
                                likeCount: 120,
                                comments: 35,
                                views:1,
                                isFavorite: false,
                                isLiked: true,
                                createTime: '2023-11-22 18:30',
                                isFollowing: false
                            },
                            {
                                id: 5,
                                title: '武汉大学樱花节',
                                content: '每年春天，武汉大学的樱花如约绽放，吸引了全国各地的游客前来观赏。校园内粉色的樱花海洋美不胜收，是拍照打卡的绝佳地点。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/docks.jpg',
                                authorName: '校园摄影师',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/marcus.jpg',
                                category: '校园',
                                tags: ['旅行', '武汉', '樱花', '校园'],
                                likes: 156,
                                views:1,
                                likeCount: 187,
                                comments: 48,
                                isFavorite: false,
                                isLiked: true,
                                createTime: '2023-11-20 14:15',
                                isFollowing: false
                            },
                            {
                                id: 6,
                                title: '期末复习经验分享',
                                content: '分享一下我的期末复习经验和方法，希望对大家有所帮助。合理安排时间，掌握学习方法，高效复习事半功倍。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/hotel.jpg',
                                authorName: '学霸君',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
                                category: '学习',
                                tags: ['学习', '复习', '经验分享'],
                                likes: 108,
                                views:1,
                                likeCount: 132,
                                comments: 27,
                                isFavorite: true,
                                isLiked: true,
                                createTime: '2023-11-18 09:20',
                                isFollowing: false
                            }
                        ];
                    });
            },
            toggleSearchStatus() {
            this.isSearching =!this.isSearching;
            this.fetchPosts(this.selectedCategory);
        },
            onSearchClick() {
            if (this.searchContent.trim()) {
                this.isSearching = true;
                this.fetchPosts(this.selectedCategory);
            }
        },
        clearSearch() {
            this.searchContent = '';
            this.isSearching = false;
            this.fetchPosts(this.selectedCategory);
        },
            openPostDetail(post) {
            // 发送请求获取帖子详情
            const config = {
            headers: {
                // 在请求头中添加 token
                Authorization: `Bearer ${this.token}` 
            }
        };
            axios.get(`/posts/${post.id}`,config)
               .then(response => {
                    const postDetail = response.data.data;
                    // 更新当前帖子的查看数

                    
                    this.selectedPost = {
                    ...post,
                    authorAvatar: post.authorAvatar || 'https://cdn.vuetifyjs.com/images/john.jpg'
                };
                post.views = postDetail.viewCount;
                    // 打开帖子详情对话框
                    this.selectedPost = post;
                    this.postDetailDialog = true;
                    
                
                })
               .catch(error => {
                    console.error('获取帖子详情失败:', error);
                });
        },
            async toggleLike(post, event) {
    event.stopPropagation(); // 阻止事件冒泡
    try {
        if (post.isLiked) {
            // 取消点赞
            await this.$axios.delete(`/post-likes/${post.id}`);
        } else {
            // 添加点赞
            await this.$axios.post(`/post-likes/${post.id}`, {
                like: true
            });
        }
        // 切换点赞状态
        post.isLiked = !post.isLiked;

        const config = {
            headers: {
                // 在请求头中添加 token
                Authorization: `Bearer ${this.token}` 
            }
        };

        // 获取更新后的点赞数
        const response = await this.$axios.get(`/post-likes/count/${post.id}`, config);
        const newLikeCount = response.data.data;

        // 更新帖子的点赞数
        post.likes = newLikeCount;
   

        // 恢复按钮状态
        const btn = event.currentTarget; // 获取触发事件的按钮
        if (btn) {
            setTimeout(() => {
                if (btn.parentNode) {
                    btn.classList.remove('clicked');
                }
            }, 300);
        }

        // 显示简单的提示消息
        this.$nextTick(() => {
            if (post.isLiked) {
                this.$toast ? this.$toast.success('点赞成功') : console.log('点赞成功');
            } else {
                this.$toast ? this.$toast.info('取消点赞成功') : console.log('取消点赞成功');
            }
        });
    } catch (error) {
        console.error('点赞操作失败:', error);
        // 如果请求失败，恢复状态
        post.isLiked = !post.isLiked;
        post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
        post.likeCount = post.isLiked ? post.likeCount + 1 : post.likeCount - 1;
    }
},
            async toggleFavorite(post, event) {
            event.stopPropagation();
            try {
                if (post.isFavorite) {
                    // 取消收藏
                    await axios.delete(`/favorites/${post.id}`);
                } else {
                    // 添加收藏
                    await axios.post(`/favorites/${post.id}`);
                }
                // 切换收藏状态
                post.isFavorite = !post.isFavorite;
                const config = {
                headers: {
                    // 在请求头中添加 token
                    Authorization: `Bearer ${this.token}` 
                }
            };
                // 获取更新后的收藏数
                const response = await axios.get(`/favorites/count/${post.id}`,config);
                const newLikeCount = response.data.data;

                // 更新帖子的收藏数
                post.likeCount = newLikeCount;
            } catch (error) {
                console.error('收藏操作失败:', error);
            }
        },
           // 原有方法
        openComments(post, event) {
            event.stopPropagation();
            this.selectedPost = post;
            this.commentDialog = true;
            this.fetchComments(post.id);
        },
        fetchComments(postId) {
            const url = `/comments/post/${postId}`;
            const likeStatusPromises = [];
            const config = {
                headers: {
                    // 在请求头中添加 token
                    Authorization: `Bearer ${this.token}` 
                }
            };
            axios.get(url, config)
               .then(response => {
                
                    this.comments = response.data.data;
                    // 遍历评论列表，获取每个评论的点赞状态
                    this.comments.forEach(comment => {
                likeStatusPromises.push(this.getCommentLikeStatus(comment.id, comment));
                if (comment.replies) {
                    comment.replies.forEach(reply => {
                        likeStatusPromises.push(this.getCommentLikeStatus(reply.id, reply));
                    });
                }
            });

            // 等待所有点赞状态请求完成
            return Promise.all(likeStatusPromises);
        }).then(() => {
            // 所有点赞状态请求完成后，强制更新视图
            this.$forceUpdate(); 
        })
      
               .catch(error => {
                    console.error('获取评论失败:', error);
                });
        },
                toggleShowReplies(comment) {
            if (!comment.showReplies) {
                // 如果回复详情未显示，先获取回复数和回复详情
                this.fetchCommentReplies(comment);
            }
            this.$set(comment,'showReplies',!comment.showReplies);
            // 强制更新视图
             this.$forceUpdate();
            
        },
        async fetchCommentReplies(comment) {
            try {
                const response = await axios.get(`/comments/replies/${comment.id}`);
                comment.replyCount = response.data.data.length;
                comment.replies = response.data.data;
            } catch (error) {
                console.error('Error fetching comment replies:', error);
            }
        },
        toggleCommentLike(){},
        getCommentLikeStatus(commentId, comment) {
            return new Promise((resolve, reject) => {
        axios.get(`/comments/like/exists?targetId=${commentId}`)
           .then(response => {
                // 更新评论的点赞状态
                Vue.set(comment, 'isLiked', response.data);
                console.log(comment.isLiked);
                // 当请求成功时，将 Promise 标记为已解决
                resolve();
            })
           .catch(error => {
                console.error('获取评论点赞状态失败:', error);
                // 当请求失败时，将 Promise 标记为已拒绝
                reject(error);
            });
    });
        },
        // 初始化评论和回复的显示状态
    initCommentStates() {
      this.comments.forEach(comment => {
        comment.showReplies = false;
        if (comment.replies) {
          this.initSubCommentStates(comment.replies);
        }
      });
    },
    initSubCommentStates(replies) {
      replies.forEach(reply => {
        reply.showReplies = false;
        if (reply.replies) {
          this.initSubCommentStates(reply.replies);
        }
      });
    },
            prepareReply(comment, parentId = null) {
                this.replyingTo = comment;
                this.replyParentId = parentId;
                this.newComment = '';  // 清空输入框
                // 自动聚焦输入框（添加安全检查）
                setTimeout(() => {
                    const inputElement = document.querySelector('.v-card-actions .v-text-field input');
                    if (inputElement) {
                        inputElement.focus();
                    }
                }, 100);
            },

            cancelReply() {
                this.replyingTo = null;
                this.replyParentId = null;
                this.newComment = '';
            },
            addComment() {
                const config = {
                headers: {
                    // 在请求头中添加 token
                    Authorization: `Bearer ${this.token}` 
                }
            };
                if (!this.newComment.trim()) return;

                if (this.replyingTo) {
                    // 处理回复逻辑
                    const replyData = {
                        content: this.newComment,
                        parentId: this.replyParentId || this.replyingTo.id
                    };

                    this.$axios.post(`/comments`,replyData, config)
                        .then(res => {
                            if (res.data.code === 200) {
                                this.handleReplySuccess(res.data.data);
                            }
                        })
                        .catch(error => {
                            console.error('添加回复失败:', error);
                            // 模拟成功
                            const newReply = {
                                id: Date.now(),
                                content: this.newComment,
                                authorName: '我',
                                authorAvatar: this.currentUser.avatar,
                                createTime: new Date().toLocaleString(),
                                replyTo: this.replyingTo.authorName
                            };
                            this.handleReplySuccess(newReply);
                        });
                } else {
                    // 原来的评论逻辑
                    this.$axios.post(`/comments`, {
                        content: this.newComment,
                        postId: this.selectedPost.id,
                        parentId: 0,
                        

                    }, config)
                        .then(res => {
                            if (res.data.code === 200) {
                                // 添加到评论列表
                                this.comments.unshift({
                                    ...res.data.data,
                                    replies: []
                                });
                                this.selectedPost.comments = (this.selectedPost.comments || 0) + 1;
                                this.newComment = ''; // 清空输入框
                            }
                        })
                        .catch(error => {
                            console.error('添加评论失败:', error);
                            // 模拟成功
                            const newComment = {
                                id: Date.now(),
                                content: this.newComment,
                                authorName: '我',
                                authorAvatar: this.currentUser.avatar,
                                createTime: new Date().toLocaleString(),
                                replies: []
                            };
                            this.comments.unshift(newComment);
                            this.selectedPost.comments = (this.selectedPost.comments || 0) + 1;
                            this.newComment = ''; // 清空输入框
                        });
                }
            },

            handleReplySuccess(newReply) {
                // 如果是回复嵌套评论
                if (this.replyParentId) {
                    // 找到父评论
                    const parentComment = this.comments.find(c => c.id === this.replyParentId);
                    if (parentComment) {
                        // 添加回复到嵌套数组
                        if (!parentComment.replies) {
                            parentComment.replies = [];
                        }
                        parentComment.replies.push(newReply);
                    }
                } else {
                    // 找到被回复的评论
                    const parentComment = this.comments.find(c => c.id === this.replyingTo.id);
                    if (parentComment) {
                        // 添加回复到嵌套数组
                        if (!parentComment.replies) {
                            parentComment.replies = [];
                        }
                        parentComment.replies.push(newReply);
                    }
                }

                // 更新评论计数并重置状态
                this.selectedPost.comments = (this.selectedPost.comments || 0) + 1;
                this.newComment = ''; // 清空输入框
                this.replyingTo = null;
                this.replyParentId = null;
            },

            prevImage(event) {
                event.stopPropagation();
                const carousel = event.currentTarget.closest('.v-carousel');
                if (carousel) {
                    const carouselComponent = this.$parent.$children.find(
                        child => child.$el === carousel && child.$options._componentTag === 'v-carousel'
                    );
                    if (carouselComponent) {
                        carouselComponent.prev();
                    }
                }
            },

            nextImage(event) {
                event.stopPropagation();
                const carousel = event.currentTarget.closest('.v-carousel');
                if (carousel) {
                    const carouselComponent = this.$parent.$children.find(
                        child => child.$el === carousel && child.$options._componentTag === 'v-carousel'
                    );
                    if (carouselComponent) {
                        carouselComponent.next();
                    }
                }
            },

            

            handleImageError(e) {
                e.target.src = 'https://cdn.vuetifyjs.com/images/john.jpg';
            },

            async toggleFollow(post, event) {
                
                if(event)event.stopPropagation();
            try {
                const config = {
                headers: {
                    // 在请求头中添加 token
                    Authorization: `Bearer ${this.token}` 
                }
            };
                
                if (post.isFollowing) {
                    // 取关
                    await axios.delete(`/relations/follow/${post.userId}`,config);
                    console.log('取关成功');
                } else {
                    // 关注
                    await axios.post(`/relations/follow/${post.userId}`,config);
                    console.log('关注成功');
                }
                // 切换收藏状态
                post.isFollowing = !post.isFollowing;
                
            } catch (error) {
                console.error('关注操作失败:', error);
                        // 如果请求失败，恢复状态
                        post.isFollowing = !post.isFollowing;
            }
            },
            async fetchPopularTags() {
                try {
                    const response = await this.$axios.get('/posts/tags');
                    if (response.data) {
                        this.popularTags = response.data.map(tag => tag.name);
                    }
                } catch (error) {
                    console.error('获取热门标签失败:', error);
                }
            }
        },

        watch: {
            // 监听路由变化
            '$route'(to) {
                const categoryFromRoute = to.query.category;
                if (categoryFromRoute && this.categories.includes(categoryFromRoute)) {
                    this.selectedCategory = categoryFromRoute;
                    this.selectedCategoryIndex = this.categories.indexOf(categoryFromRoute);
                    this.fetchPosts(categoryFromRoute);
                }
            },
            // 监听tab索引变化
            selectedCategoryIndex(newIndex) {
                this.selectedCategory = this.categories[newIndex];
            },
            sortOption() {
                this.fetchPosts();
            }
        },

        created() {
            // 检查路由参数中是否有指定的分类
            const categoryFromRoute = this.$route.query.category;
            // 检查localStorage中是否有用户选择的兴趣
            const userInterest = localStorage.getItem('userInterest');
            
            // 优先使用路由参数，其次使用localStorage中的兴趣
            const targetCategory = categoryFromRoute || userInterest;
            
            // 如果有指定的分类且该分类存在于分类列表中，则设置为当前选中的分类
            if (targetCategory && this.categories.includes(targetCategory)) {
                this.selectedCategory = targetCategory;
                this.selectedCategoryIndex = this.categories.indexOf(targetCategory); // 同时设置索引
                console.log('设置用户选择的分类:', targetCategory, '索引:', this.selectedCategoryIndex);
                // 立即获取该分类的帖子
                this.fetchPosts(targetCategory);
            } else {
                // 如果没有指定分类，则使用默认的"全部"分类
                this.selectedCategoryIndex = 0; // 设置默认索引
                this.fetchPosts(this.selectedCategory);
            }
            
            // 清除localStorage中的兴趣信息（一次性使用）
            if (userInterest) {
                localStorage.removeItem('userInterest');
            }
            
            // 获取热门标签和初始化评论状态
            this.fetchPopularTags();
            this.initCommentStates();
        }
        
    }
</script>

<style scoped>
/* 可以根据需要调整滚动条样式 */
.comments-container::-webkit-scrollbar {
    width: 8px;
}

.comments-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.comments-container::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
}
    .content-preview {
        max-height: 60px;
        overflow: hidden;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        padding-bottom: 0;
    }

    .transparent-btn {
        background-color: transparent !important;
        border-color: transparent !important;
    }

    .highlight {
        background-color: #FFFF00;
        font-weight: bold;
    }

    .v-card__title {
        word-break: normal;
        white-space: normal;
    }

    .fixed-button {
        position: fixed;
        right: 150px;
        bottom: 150px;
    }

    /* 修改评论容器滚动样式 */
    .comments-container {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 16px;
        /* 增加右侧内边距，为滚动条留出更多空间 */
        margin-right: 8px;
        /* 添加右侧外边距 */
    }

    /* 美化滚动条样式 (仅适用于WebKit浏览器，如Chrome和Safari) */
    .comments-container::-webkit-scrollbar {
        width: 6px;
    }

    .comments-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    .comments-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
    }

    .comments-container::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    /* 添加点赞和收藏按钮动画效果 */
    .like-btn,
    .favorite-btn {
        transition: transform 0.3s ease;
    }

    .like-btn.clicked,
    .favorite-btn.clicked {
        transform: scale(1.5);
    }

    .pulse-animation {
        animation: pulse 0.5s;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.3);
        }

        100% {
            transform: scale(1);
        }
    }

    .like-count-text,
    .favorite-count-text {
        transition: color 0.3s ease;
    }

    /* 防止事件冒泡导致卡片点击 */
    .like-btn,
    .favorite-btn {
        position: relative;
        z-index: 2;
    }

    .carousel-controls {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 0 8px;
    }

    .carousel-arrow {
        background: rgba(0, 0, 0, 0.3) !important;
        color: white !important;
    }

    /* 轮播图标题样式 */
    .carousel-container {
        position: relative;
    }

    .carousel-title-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
        padding: 20px 16px 10px;
        z-index: 1;
        /* 确保标题在轮播图上方 */
    }

    /* 悬停时显示指示点
    .carousel-container .v-carousel__controls {
        opacity: 0;
        transition: opacity 0.3s ease;
    } */

    .carousel-container:hover .v-carousel__controls {
        opacity: 1;
    }

    .post-detail-content {
        font-size: 16px;
        line-height: 1.6;
        margin: 16px 0;
    }

    .post-detail-content p {
        white-space: pre-wrap;
        /* 保留换行符 */
        margin-bottom: 16px;
    }

    /* 添加图片网格样式 */
    .post-images img {
        object-fit: cover;
        border-radius: 4px;
    }

    .post-detail-cover {
        object-fit: cover;
    }

    .post-card {
        cursor: pointer;
        transition: transform 0.2s;
    }

    .post-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* 帖子详情样式 - 移除内容预览的高度限制 */
    .post-detail .content-preview {
        max-height: none !important;
        /* 覆盖原始限制 */
        overflow: visible !important;
    }

    .post-detail-content {
        font-size: 16px;
        line-height: 1.6;
        white-space: pre-wrap;
        /* 保留换行符 */
    }

    /* 确保对话框中的内容不会被截断 */
    .post-detail .v-card__text {
        overflow: visible;
    }

    .follow-btn {
        min-width: 70px;
        text-transform: none;
    }
    
</style>