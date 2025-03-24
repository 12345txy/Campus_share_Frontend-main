<template>
    <v-app>
        <v-container>
            <!-- 种类选择（Category）筛选 -->
            <v-chip-group dense v-model="selectedCategory" active-class="indigo--text text--accent-4 font-weight-black"
                mandatory center-active show-arrows>
                <v-chip v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                </v-chip>
            </v-chip-group>

            <!-- 搜索部分 -->
            <v-container d-flex class="pb-0">
                <v-btn rounded class="mr-2 font-weight-black" color="indigo" dark @click="toggleSearchMode">
                    <v-icon left>
                        {{ searchIcon }}
                    </v-icon>
                    {{ searchText }}
                </v-btn>
                <div style="position: relative; width: 80%;">
                    <v-menu offset-y v-model="displayResults" nudge-top="20" :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="searchContent" :label="searchPlaceholder" append-icon="mdi-magnify"
                                @input="search" v-bind="attrs" clearable v-on="on" outlined dense style="width: 100%;">
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
                </div>
            </v-container>

            <!-- 标签筛选 -->
            <v-container class="pt-0 pb-2">
                <v-chip-group active-class="primary--text" column>
                    <v-chip v-for="tag in popularTags" :key="tag" :input-value="selectedTags.includes(tag)"
                        @click="toggleTag(tag)" filter outlined>
                        #{{ tag }}
                    </v-chip>
                </v-chip-group>
            </v-container>

            <!-- 排序选项 -->
            <v-container pt-0>
                <v-chip-group column active-class="indigo--text" v-model="sortOption" mandatory>
                    <v-chip filter outlined>最新</v-chip>
                    <v-chip filter outlined>热门</v-chip>
                    <v-chip filter outlined>推荐</v-chip>
                </v-chip-group>

                <!-- 帖子卡片展示 -->
                <v-container>
                    <v-row>
                        <v-col v-for="post in posts" :key="post.id" cols="12" sm="6" md="4">
                            <v-card class="mx-auto" max-width="400" hover>
                                <v-img :src="post.coverImage" height="200" class="white--text align-end">
                                    <v-card-title class="text-h6">{{ post.title }}</v-card-title>
                                </v-img>
                                <v-card-text class="content-preview">
                                    {{ post.content ? post.content.substring(0, 50) + (post.content.length > 50 ? '...'
                                    : '') : '暂无内容' }}
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
                                        <v-avatar size="24">
                                            <v-img :src="post.authorAvatar"></v-img>
                                        </v-avatar>
                                        <span class="ml-1 caption">{{ post.authorName }}</span>
                                        <v-spacer></v-spacer>
                                        <div class="d-flex align-center">
                                            <!-- 点赞按钮 -->
                                            <v-btn icon x-small color="blue" class="mr-1" @click="toggleLike(post)">
                                                <v-icon small>{{ post.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'
                                                    }}</v-icon>
                                            </v-btn>
                                            <span class="mr-2 caption">{{ post.likeCount || 0 }}</span>

                                            <!-- 收藏按钮 -->
                                            <v-btn icon x-small color="red" class="mr-1" @click="toggleFavorite(post)">
                                                <v-icon small>{{ post.isFavorite ? 'mdi-heart' : 'mdi-heart-outline'
                                                    }}</v-icon>
                                            </v-btn>
                                            <span class="mr-2 caption">{{ post.likes }}</span>

                                            <!-- 评论按钮 -->
                                            <v-btn icon x-small class="mr-1" @click="openComments(post)">
                                                <v-icon small>mdi-comment-outline</v-icon>
                                            </v-btn>
                                            <span class="caption">{{ post.comments || 0 }}</span>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>

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
                    <v-card-text>
                        <v-list two-line>
                            <v-list-item v-for="(comment, index) in comments" :key="index">
                                <v-list-item-avatar>
                                    <v-img :src="comment.authorAvatar"></v-img>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title>{{ comment.authorName }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ comment.content }}</v-list-item-subtitle>
                                    <div class="caption grey--text text--darken-1 mt-1">{{ comment.createTime }}</div>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-if="comments.length === 0">
                                <v-list-item-content class="text-center">
                                    <v-list-item-title>暂无评论</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-text-field v-model="newComment" label="添加评论" outlined dense append-icon="mdi-send"
                            hide-details @click:append="addComment" @keyup.enter="addComment"></v-text-field>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </v-app>
</template>

<script>
    export default {
        data: () => ({
            // 搜索相关
            searchMode: 0, // 0: 内容搜索, 1: 用户搜索, 2: 标签搜索
            searchContent: '',
            searchResults: [],
            displayResults: false,

            // 分类相关
            selectedCategory: '全部',
            categories: ['全部', '旅游', '美食', '学习', '校园', '生活', '情感', '科技', '娱乐', '体育'],

            // 标签相关
            selectedTags: [],
            popularTags: ['旅行', '美食', '校园', '学习', '电影', '音乐', '游戏', '读书', '摄影'],

            // 排序方式
            sortOption: 0, // 0: 最新, 1: 热门, 2: 推荐

            // 帖子数据
            posts: [],

            // 评论相关
            commentDialog: false,
            selectedPost: null,
            comments: [],
            newComment: '',

            // 用户信息
            currentUser: {
                id: 1,
                avatar: 'https://cdn.vuetifyjs.com/images/john.jpg'
            }
        }),

        computed: {
            searchIcon() {
                switch (this.searchMode) {
                    case 0: return 'mdi-magnify';
                    case 1: return 'mdi-account-search';
                    case 2: return 'mdi-tag-search';
                    default: return 'mdi-magnify';
                }
            },
            searchText() {
                switch (this.searchMode) {
                    case 0: return '内容搜索';
                    case 1: return '用户搜索';
                    case 2: return '标签搜索';
                    default: return '搜索';
                }
            },
            searchPlaceholder() {
                switch (this.searchMode) {
                    case 0: return '搜索帖子标题和内容';
                    case 1: return '搜索用户名';
                    case 2: return '搜索标签';
                    default: return '搜索';
                }
            }
        },

        methods: {
            toggleSearchMode() {
                this.searchMode = (this.searchMode + 1) % 3;
                this.searchContent = '';
                this.searchResults = [];
            },

            search() {
                if (!this.searchContent.trim()) {
                    this.searchResults = [];
                    return;
                }

                // 这里向后端发送请求进行搜索
                this.$axios.post('/api/posts/search', {
                    mode: this.searchMode,
                    query: this.searchContent,
                    category: this.selectedCategory !== '全部' ? this.selectedCategory : '',
                    tags: this.selectedTags
                })
                    .then(response => {
                        if (response.data.code === 200) {
                            this.searchResults = response.data.data;
                        }
                    })
                    .catch(error => {
                        console.error('搜索失败:', error);
                        // 模拟搜索结果
                        this.searchResults = this.posts.filter(post => {
                            if (this.searchMode === 0) {
                                // 内容搜索
                                return post.title.includes(this.searchContent) ||
                                    post.content.includes(this.searchContent);
                            } else if (this.searchMode === 1) {
                                // 用户搜索
                                return post.authorName.includes(this.searchContent);
                            } else {
                                // 标签搜索
                                return post.tags && post.tags.some(tag => tag.includes(this.searchContent));
                            }
                        });
                    });
            },

            getPostIcon(post) {
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

                return categoryIcons[post.category] || 'mdi-text-box';
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

            fetchPosts() {
                // 从后端获取帖子列表
                this.$axios.post('/api/posts', {
                    category: this.selectedCategory !== '全部' ? this.selectedCategory : '',
                    tags: this.selectedTags,
                    sortBy: ['newest', 'popular', 'recommended'][this.sortOption]
                })
                    .then(response => {
                        if (response.data.code === 200) {
                            this.posts = response.data.data;
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
                                authorName: '旅行达人',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                                category: '旅游',
                                tags: ['旅行', '杭州', '西湖'],
                                likes: 42,
                                likeCount: 53,
                                comments: 8,
                                isFavorite: false,
                                isLiked: false,
                                createTime: '2023-12-01 15:30'
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
                                isFavorite: true,
                                isLiked: false,
                                createTime: '2023-11-28 20:15'
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
                                comments: 42,
                                isFavorite: true,
                                isLiked: false,
                                createTime: '2023-11-25 10:45'
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
                                isFavorite: false,
                                isLiked: true,
                                createTime: '2023-11-22 18:30'
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
                                likeCount: 187,
                                comments: 48,
                                isFavorite: false,
                                isLiked: true,
                                createTime: '2023-11-20 14:15'
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
                                likeCount: 132,
                                comments: 27,
                                isFavorite: true,
                                isLiked: true,
                                createTime: '2023-11-18 09:20'
                            }
                        ];
                    });
            },

            toggleLike(post) {
                // 切换点赞状态
                post.isLiked = !post.isLiked;
                post.likeCount = post.isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1;

                // 向后端发送更新请求
                this.$axios.post(`/api/posts/${post.id}/like`, {
                    like: post.isLiked
                }).catch(error => {
                    console.error('更新点赞状态失败:', error);
                    // 失败时恢复状态
                    post.isLiked = !post.isLiked;
                    post.likeCount = post.isLiked ? post.likeCount + 1 : post.likeCount - 1;
                });
            },

            toggleFavorite(post) {
                // 切换收藏状态
                post.isFavorite = !post.isFavorite;

                // 向后端发送更新请求
                this.$axios.post(`/api/posts/${post.id}/favorite`, {
                    favorite: post.isFavorite
                }).catch(error => {
                    console.error('更新收藏状态失败:', error);
                    // 失败时恢复状态
                    post.isFavorite = !post.isFavorite;
                });
            },

            openComments(post) {
                // 打开评论对话框
                this.selectedPost = post;
                this.commentDialog = true;
                this.fetchComments(post.id);
            },

            fetchComments(postId) {
                // 获取评论列表
                this.$axios.get(`/api/posts/${postId}/comments`)
                    .then(response => {
                        if (response.data.code === 200) {
                            this.comments = response.data.data;
                        }
                    })
                    .catch(error => {
                        console.error('获取评论列表失败:', error);
                        // 模拟数据
                        this.comments = [
                            {
                                id: 1,
                                content: '非常棒的分享！',
                                authorName: '用户A',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
                                createTime: '2023-06-15 14:30'
                            },
                            {
                                id: 2,
                                content: '谢谢分享！',
                                authorName: '用户B',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
                                createTime: '2023-06-15 15:45'
                            }
                        ];
                    });
            },

            addComment() {
                if (!this.newComment.trim()) return;

                // 向后端发送添加评论请求
                this.$axios.post(`/api/posts/${this.selectedPost.id}/comments`, {
                    content: this.newComment
                })
                    .then(res => {
                        if (res.data.code === 200) {
                            // 添加到评论列表
                            this.comments.unshift(res.data.data);
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
                            createTime: new Date().toLocaleString()
                        };
                        this.comments.unshift(newComment);
                        this.selectedPost.comments = (this.selectedPost.comments || 0) + 1;
                        this.newComment = ''; // 清空输入框
                    });
            }
        },

        watch: {
            selectedCategory() {
                this.fetchPosts();
            },

            sortOption() {
                this.fetchPosts();
            }
        },

        created() {
            // 初始化时获取帖子列表
            this.fetchPosts();
        }
    }
</script>

<style scoped>
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
</style>