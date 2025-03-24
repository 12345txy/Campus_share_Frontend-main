<template>
    <v-app>
        <v-container class="pa-0 mt-0" fluid>
            <!-- 顶部基本信息部分 -->
            <v-card flat class="profile-header">
                <v-img src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg" height="350"
                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.8)" class="profile-cover">
                    <v-row class="fill-height" align="end">
                        <v-col cols="4" sm="4" md="3" class="pb-0 pt-5 text-center">
                            <v-avatar size="180" class="profile-avatar mx-auto mb-3" @click="avatarDialog = true">
                                <v-img v-if="avatar" :src="avatar"></v-img>
                                <v-icon v-else size="80" color="grey lighten-2">mdi-account</v-icon>
                            </v-avatar>
                            <!-- 用户名和昵称与头像垂直对齐 -->
                            <div class="text-center mb-1">
                                <span class="text-h5 grey--text text--lighten-2">向前的Txy</span>
                                <span class="caption white--text">{{ username }}</span>
                            </div>
                            <div class="text-center">
                                <span class="body-1 grey--text text--lighten-2">用户名:user_123456</span>
                                <span class="caption white--text">{{ nickname }}</span>
                            </div>
                        </v-col>
                        <v-col class="white--text pb-6 mb-13 ml-0">
                            <div class="d-flex align-center">
                                <v-icon medium color="grey lighten-2" class="mr-2">mdi-gender-male</v-icon>
                                <span class="body-1 white--text text--lighten-2">性别：</span>
                                <span class="body-1 white--text ml-1">{{ getGenderText(gender) }}</span>
                            </div>
                            <div class="d-flex align-center mt-2">
                                <v-icon medium color="grey lighten-2" class="mr-2">mdi-email</v-icon>
                                <span class="body-1 grey--text text--lighten-2">邮箱：</span>
                                <span class="body-1 white--text ml-1">2350439365@qq.com</span>
                            </div>
                            <div class="d-flex align-center mt-2">
                                <v-icon medium color="grey lighten-2" class="mr-2">mdi-phone</v-icon>
                                <span class="body-1 grey--text text--lighten-2">电话：</span>
                                <span class="body-1 white--text ml-1">18888888888</span>
                            </div>
                            <div class="mt-3 body-1">个人简介：{{ bio || '这个人很懒，什么都没有留下...' }}</div>
                        </v-col>
                        <v-col cols="12" sm="auto" class="text-right pb-6">
                            <v-btn v-if="!isCurrentUser" color="primary" rounded small class="ma-2"
                                @click="toggleFollow">
                                <v-icon left>{{ isFollowed ? 'mdi-account-minus' : 'mdi-account-plus' }}</v-icon>
                                {{ isFollowed ? '取消关注' : '关注' }}
                            </v-btn>
                            <v-btn color="primary" rounded small class="ma-2" @click="showEditDialog = true">
                                <v-icon left>mdi-pencil</v-icon>
                                编辑资料
                            </v-btn>
                        </v-col>
                    </v-row>

                </v-img>


                <!-- 头像上传对话框 -->
                <v-dialog v-model="avatarDialog" max-width="500px">
                    <v-card>
                        <v-card-title>更换头像</v-card-title>
                        <v-card-text>
                            <v-file-input v-model="avatarFile" accept="image/*" label="选择图片" prepend-icon="mdi-camera"
                                @change="onAvatarChange"></v-file-input>
                            <v-img v-if="avatarPreview" :src="avatarPreview" max-height="300" contain
                                class="mt-4"></v-img>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" text @click="avatarDialog = false">取消</v-btn>
                            <v-btn color="success" @click="saveAvatar" :disabled="!avatarFile">
                                确认
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- 编辑个人信息对话框 -->
                <v-dialog v-model="showEditDialog" max-width="600px">
                    <v-card>
                        <v-card-title>
                            编辑个人资料
                            <v-spacer></v-spacer>
                            <v-btn icon @click="showEditDialog = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-card-text>
                            <v-form ref="form" v-model="valid">
                                <v-text-field v-model="editData.nickname" label="昵称" outlined dense
                                    :rules="[rules.required]"></v-text-field>

                                <v-select v-model="editData.gender" :items="genderOptions" label="性别" outlined
                                    dense></v-select>

                                <v-text-field v-model="editData.email" label="邮箱" outlined dense
                                    :rules="[rules.required, rules.email]"></v-text-field>

                                <v-text-field v-model="editData.phone" label="电话号码" outlined dense
                                    :rules="[rules.required, rules.phone]"></v-text-field>

                                <v-textarea v-model="editData.bio" label="个人简介" outlined auto-grow
                                    rows="3"></v-textarea>
                            </v-form>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" text @click="cancelEditing">取消</v-btn>
                            <v-btn color="success" @click="saveProfile" :loading="loading">
                                保存
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-card>

            <!-- 统计信息部分 -->
            <v-card flat class="mt-3">
                <v-row no-gutters>
                    <v-col cols="3">
                        <v-btn text block height="60" @click="showFollowers = true">
                            <div class="text-center">
                                <div class="text-h6">{{ followersCount }}</div>
                                <div class="caption">粉丝</div>
                            </div>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn text block height="60" @click="showFollowing = true">
                            <div class="text-center">
                                <div class="text-h6">{{ followingCount }}</div>
                                <div class="caption">关注</div>
                            </div>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn text block height="60">
                            <div class="text-center">
                                <div class="text-h6">{{ favoritesCount }}</div>
                                <div class="caption">收藏</div>
                            </div>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn text block height="60">
                            <div class="text-center">
                                <div class="text-h6">{{ receivedLikesCount }}</div>
                                <div class="caption">获赞</div>
                            </div>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>

            <!-- 点赞对话框 -->
            <v-dialog v-model="showLiked" max-width="500">
                <v-card>
                    <v-card-title>
                        我赞过的
                        <v-spacer></v-spacer>
                        <v-btn icon @click="showLiked = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-list>
                        <v-list-item v-for="(post, index) in likedPosts" :key="index">
                            <v-list-item-avatar>
                                <v-img :src="post.coverImage"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ post.title }}</v-list-item-title>
                                <v-list-item-subtitle>作者：{{ post.authorName }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn small icon color="red">
                                    <v-icon>mdi-heart</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                        <v-list-item v-if="likedPosts.length === 0">
                            <v-list-item-content class="text-center">
                                <v-list-item-title>暂无点赞的帖子</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>

            <!-- 粉丝对话框 -->
            <v-dialog v-model="showFollowers" max-width="500">
                <v-card>
                    <v-card-title>
                        粉丝
                        <v-spacer></v-spacer>
                        <v-btn icon @click="showFollowers = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-list>
                        <v-list-item v-for="(follower, index) in followers" :key="index">
                            <v-list-item-avatar>
                                <v-img :src="follower.avatar"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ follower.nickname }}</v-list-item-title>
                                <v-list-item-subtitle>{{ follower.username }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn small outlined rounded>关注</v-btn>
                            </v-list-item-action>
                        </v-list-item>
                        <v-list-item v-if="followers.length === 0">
                            <v-list-item-content class="text-center">
                                <v-list-item-title>暂无粉丝</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>

            <!-- 关注对话框 -->
            <v-dialog v-model="showFollowing" max-width="500">
                <v-card>
                    <v-card-title>
                        关注
                        <v-spacer></v-spacer>
                        <v-btn icon @click="showFollowing = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-list>
                        <v-list-item v-for="(following, index) in followings" :key="index">
                            <v-list-item-avatar>
                                <v-img :src="following.avatar"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ following.nickname }}</v-list-item-title>
                                <v-list-item-subtitle>{{ following.username }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn small outlined rounded color="error">取消关注</v-btn>
                            </v-list-item-action>
                        </v-list-item>
                        <v-list-item v-if="followings.length === 0">
                            <v-list-item-content class="text-center">
                                <v-list-item-title>暂无关注</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>

            <!-- 内容展示部分 -->
            <v-card flat class="mt-4">
                <v-tabs v-model="activeTab" background-color="transparent" grow>
                    <v-tab>
                        <v-icon left>mdi-note-text</v-icon>
                        我的帖子
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-heart</v-icon>
                        我的收藏
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-thumb-up</v-icon>
                        我赞过的
                    </v-tab>
                </v-tabs>
                <!-- <v-divider></v-divider> -->
                <v-tabs-items v-model="activeTab">
                    <!-- 我的帖子 -->
                    <v-tab-item>
                        <v-container fluid>
                            <v-row v-if="myPosts.length > 0">
                                <v-col v-for="(post, index) in myPosts" :key="index" cols="6" sm="4" md="3">
                                    <v-card class="mx-auto" max-width="400" hover>
                                        <v-img :src="post.coverImage" height="200" class="white--text align-end">
                                            <v-card-title class="text-h6">{{ post.title }}</v-card-title>
                                        </v-img>
                                        <v-card-text class="content-preview">
                                            {{ post.content ? post.content.substring(0, 50) + (post.content.length > 50
                                            ? '...' : '') : '暂无内容' }}
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
                                                    <v-btn icon x-small color="blue" class="mr-1"
                                                        @click="toggleLike(post)">
                                                        <v-icon small>{{ post.isLiked ? 'mdi-thumb-up' :
                                                            'mdi-thumb-up-outline' }}</v-icon>
                                                    </v-btn>
                                                    <span class="mr-2 caption">{{ post.likeCount || 0 }}</span>
                                                    <!-- 收藏按钮 -->
                                                    <v-btn icon x-small color="red" class="mr-1"
                                                        @click="toggleFavorite(post)">
                                                        <v-icon small>{{ post.isFavorite ? 'mdi-heart' :
                                                            'mdi-heart-outline' }}</v-icon>
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
                            <v-row v-else>
                                <v-col cols="12" class="text-center py-5">
                                    <v-icon size="64" color="grey lighten-1">mdi-note-text-outline</v-icon>
                                    <div class="mt-3 grey--text text--darken-1">暂无发布的帖子</div>
                                    <v-btn color="primary" class="mt-3" rounded>
                                        <v-icon left>mdi-plus</v-icon>
                                        发布新帖子
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tab-item>

                    <!-- 我的收藏 -->
                    <v-tab-item>
                        <v-container fluid>
                            <v-row v-if="favoritePosts.length > 0">
                                <v-col v-for="(post, index) in favoritePosts" :key="index" cols="6" sm="4" md="3">
                                    <v-card class="mx-auto" max-width="400" hover>
                                        <v-img :src="post.coverImage" height="200" class="white--text align-end">
                                            <v-card-title class="text-h6">{{ post.title }}</v-card-title>
                                        </v-img>
                                        <v-card-text class="content-preview">
                                            {{ post.content ? post.content.substring(0, 50) + (post.content.length > 50
                                            ? '...' : '') : '暂无内容' }}
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
                                                    <v-btn icon x-small color="blue" class="mr-1"
                                                        @click="toggleLike(post)">
                                                        <v-icon small>{{ post.isLiked ? 'mdi-thumb-up' :
                                                            'mdi-thumb-up-outline' }}</v-icon>
                                                    </v-btn>
                                                    <span class="mr-2 caption">{{ post.likeCount || 0 }}</span>
                                                    <!-- 收藏按钮 -->
                                                    <v-btn icon x-small color="red" class="mr-1"
                                                        @click="toggleFavorite(post)">
                                                        <v-icon small>{{ post.isFavorite ? 'mdi-heart' :
                                                            'mdi-heart-outline' }}</v-icon>
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
                            <v-row v-else>
                                <v-col cols="12" class="text-center py-5">
                                    <v-icon size="64" color="grey lighten-1">mdi-heart-outline</v-icon>
                                    <div class="mt-3 grey--text text--darken-1">暂无收藏的帖子</div>
                                    <v-btn color="primary" class="mt-3" rounded>
                                        <v-icon left>mdi-magnify</v-icon>
                                        去发现
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tab-item>

                    <!-- 我赞过的 -->
                    <v-tab-item>
                        <v-container fluid>
                            <v-row v-if="likedPosts.length > 0">
                                <v-col v-for="(post, index) in likedPosts" :key="index" cols="6" sm="4" md="3">
                                    <v-card class="mx-auto" max-width="400" hover>
                                        <v-img :src="post.coverImage" height="200" class="white--text align-end">
                                            <v-card-title class="text-h6">{{ post.title }}</v-card-title>
                                        </v-img>
                                        <v-card-text class="content-preview">
                                            {{ post.content ? post.content.substring(0, 50) + (post.content.length > 50
                                            ? '...' : '') : '暂无内容' }}
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
                                                    <v-btn icon x-small color="blue" class="mr-1"
                                                        @click="toggleLike(post)">
                                                        <v-icon small>{{ post.isLiked ? 'mdi-thumb-up' :
                                                            'mdi-thumb-up-outline' }}</v-icon>
                                                    </v-btn>
                                                    <span class="mr-2 caption">{{ post.likeCount || 0 }}</span>
                                                    <!-- 收藏按钮 -->
                                                    <v-btn icon x-small color="red" class="mr-1"
                                                        @click="toggleFavorite(post)">
                                                        <v-icon small>{{ post.isFavorite ? 'mdi-heart' :
                                                            'mdi-heart-outline' }}</v-icon>
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
                            <v-row v-else>
                                <v-col cols="12" class="text-center py-5">
                                    <v-icon size="64" color="grey lighten-1">mdi-thumb-up-outline</v-icon>
                                    <div class="mt-3 grey--text text--darken-1">暂无点赞的帖子</div>
                                    <v-btn color="primary" class="mt-3" rounded>
                                        <v-icon left>mdi-magnify</v-icon>
                                        去发现
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tab-item>
                </v-tabs-items>
            </v-card>

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
        name: 'UserProfile',
        data: () => ({
            valid: true,
            loading: false,
            avatar: null,
            avatarFile: null,
            avatarPreview: null,
            avatarDialog: false,
            showEditDialog: false,
            username: '',
            nickname: '',
            gender: '',
            email: '',
            phone: '',
            bio: '',
            // 编辑时的临时数据
            editData: {
                nickname: '',
                gender: '',
                email: '',
                phone: '',
                bio: ''
            },
            genderOptions: [
                { text: '男', value: 'male' },
                { text: '女', value: 'female' },
                { text: '保密', value: 'secret' }
            ],
            rules: {
                required: v => !!v || '此字段为必填项',
                email: v => {
                    const pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
                    return pattern.test(v) || '请输入有效的邮箱地址'
                },
                phone: v => {
                    const pattern = /^1[3456789]\d{9}$/
                    return pattern.test(v) || '请输入有效的手机号码'
                }
            },
            // 保存编辑前的数据
            originalData: null,

            // 统计数据
            followersCount: 0,
            followingCount: 0,
            favoritesCount: 0,
            receivedLikesCount: 0,

            // 关注和粉丝列表
            showFollowers: false,
            showFollowing: false,
            showLiked: false,
            followers: [],
            followings: [],
            likedPosts: [],

            // 内容展示
            activeTab: 0,
            myPosts: [],
            favoritePosts: [],
            isCurrentUser: true, // 是否是当前用户的资料页
            isFollowed: false,   // 是否已关注该用户
            commentDialog: false,
            selectedPost: null,
            comments: [],
            newComment: '',
        }),

        created() {
            this.fetchUserProfile()
            this.fetchUserStats()
            this.fetchUserPosts()
            this.fetchUserFavorites()
            this.fetchUserLikedPosts()
            this.checkFollowStatus() // 检查关注状态
        },

        methods: {
            fetchUserProfile() {
                // 从后端获取用户信息
                this.$axios.get('/api/user/profile')
                    .then(res => {
                        if (res.data.code === 200) {
                            const data = res.data.data
                            this.username = data.username
                            this.nickname = data.nickname
                            this.gender = data.gender
                            this.email = data.email
                            this.phone = data.phone
                            this.bio = data.bio
                            this.avatar = data.avatar
                        }
                    })
                    .catch(error => {
                        console.error('获取用户信息失败:', error)
                    })
            },

            fetchUserStats() {
                // 修改获取用户统计数据
                this.$axios.get('/api/user/stats')
                    .then(res => {
                        if (res.data.code === 200) {
                            const data = res.data.data
                            this.followersCount = data.followersCount
                            this.followingCount = data.followingCount
                            this.favoritesCount = data.favoritesCount
                            this.receivedLikesCount = data.receivedLikesCount // 获赞数量
                        }
                    })
                    .catch(error => {
                        console.error('获取用户统计数据失败:', error)
                        // 模拟数据
                        this.followersCount = 128
                        this.followingCount = 56
                        this.favoritesCount = 42
                        this.receivedLikesCount = 231 // 模拟获赞数量
                    })
            },

            fetchUserPosts() {
                // 模拟获取用户帖子
                this.$axios.get('/api/user/posts')
                    .then(res => {
                        if (res.data.code === 200) {
                            this.myPosts = res.data.data
                        }
                    })
                    .catch(error => {
                        console.error('获取用户帖子失败:', error)
                        // 模拟数据
                        this.myPosts = [
                            {
                                id: 1,
                                title: '杭州西湖一日游',
                                content: '杭州西湖是中国著名的旅游景点，我在这里度过了愉快的一天。湖水清澈，景色优美，特别推荐断桥和雷峰塔。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
                                authorName: '向前的Txy',
                                authorAvatar: this.avatar || 'https://cdn.vuetifyjs.com/images/john.jpg',
                                likes: 42,
                                likeCount: 53,
                                comments: 8,
                                isFavorite: false,
                                isLiked: false
                            },
                            {
                                id: 2,
                                title: '上海外滩夜景',
                                content: '上海外滩的夜景非常壮观，东方明珠和各种高楼大厦的灯光映照在黄浦江上，美不胜收。推荐傍晚时分前往，可以同时欣赏日落和夜景。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/road.jpg',
                                authorName: '向前的Txy',
                                authorAvatar: this.avatar || 'https://cdn.vuetifyjs.com/images/john.jpg',
                                likes: 36,
                                likeCount: 48,
                                comments: 5,
                                isFavorite: false,
                                isLiked: false
                            }
                        ]
                    })
            },

            fetchUserFavorites() {
                // 模拟获取用户收藏
                this.$axios.get('/api/user/favorites')
                    .then(res => {
                        if (res.data.code === 200) {
                            this.favoritePosts = res.data.data
                        }
                    })
                    .catch(error => {
                        console.error('获取用户收藏失败:', error)
                        // 模拟数据
                        this.favoritePosts = [
                            {
                                id: 3,
                                title: '北京故宫博物院',
                                content: '北京故宫是中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一，也是中国古代宫廷建筑之精华。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/house.jpg',
                                authorName: '旅行达人',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                                likes: 128,
                                likeCount: 86,
                                comments: 42,
                                isFavorite: true,
                                isLiked: false
                            },
                            {
                                id: 4,
                                title: '成都美食攻略',
                                content: '成都作为美食之都，有着丰富多彩的美食文化。这里推荐几家必吃的地道川菜馆，让你体验正宗川菜的麻辣鲜香。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
                                authorName: '美食家',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/ben.jpg',
                                likes: 96,
                                likeCount: 120,
                                comments: 35,
                                isFavorite: true,
                                isLiked: true
                            }
                        ]
                    })
            },

            fetchUserLikedPosts() {
                // 模拟获取用户点赞的帖子
                this.$axios.get('/api/user/liked-posts')
                    .then(res => {
                        if (res.data.code === 200) {
                            this.likedPosts = res.data.data
                        }
                    })
                    .catch(error => {
                        console.error('获取用户点赞的帖子失败:', error)
                        // 模拟数据
                        this.likedPosts = [
                            {
                                id: 5,
                                title: '武汉大学樱花节',
                                content: '每年春天，武汉大学的樱花如约绽放，吸引了全国各地的游客前来观赏。校园内粉色的樱花海洋美不胜收，是拍照打卡的绝佳地点。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/docks.jpg',
                                authorName: '旅游爱好者',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/profiles/marcus.jpg',
                                likes: 156,
                                likeCount: 187,
                                comments: 48,
                                isFavorite: false,
                                isLiked: true
                            },
                            {
                                id: 6,
                                title: '南京大学四季风景',
                                content: '南京大学四季风景如画，每个季节都有不同的美景，是摄影爱好者的天堂。春有樱花，夏有绿荫，秋有红叶，冬有白雪。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/hotel.jpg',
                                authorName: '校园摄影师',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
                                likes: 108,
                                likeCount: 132,
                                comments: 27,
                                isFavorite: true,
                                isLiked: true
                            },
                            {
                                id: 7,
                                title: '哈尔滨工业大学冰雪节',
                                content: '哈工大的冰雪节是冬季最受欢迎的校园活动之一，校园内的冰雕、雪雕作品精美绝伦，夜晚的彩灯照射下更显梦幻。',
                                coverImage: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg',
                                authorName: '北方旅行家',
                                authorAvatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
                                likes: 76,
                                likeCount: 95,
                                comments: 18,
                                isFavorite: false,
                                isLiked: true
                            }
                        ]
                    })
            },

            onAvatarChange(file) {
                if (file) {
                    const reader = new FileReader()
                    reader.onload = e => {
                        this.avatarPreview = e.target.result
                    }
                    reader.readAsDataURL(file)
                } else {
                    this.avatarPreview = null
                }
            },

            saveAvatar() {
                if (this.avatarFile) {
                    this.avatar = this.avatarPreview
                    this.avatarDialog = false

                    // 这里可以单独上传头像
                    const formData = new FormData()
                    formData.append('avatar', this.avatarFile)

                    this.$axios.post('/api/user/avatar/update', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then(res => {
                        if (res.data.code === 200) {
                            window.alert('头像更新成功')
                        }
                    }).catch(error => {
                        console.error('头像更新失败:', error)
                    })
                }
            },

            startEditing() {
                this.originalData = {
                    nickname: this.nickname,
                    gender: this.gender,
                    email: this.email,
                    phone: this.phone,
                    bio: this.bio
                }
                this.editing = true
            },

            cancelEditing() {
                // 恢复原始数据
                Object.assign(this, this.originalData)
                this.editing = false
            },

            async saveProfile() {
                this.loading = true
                const formData = new FormData()
                formData.append('nickname', this.nickname)
                formData.append('gender', this.gender)
                formData.append('email', this.email)
                formData.append('phone', this.phone)
                formData.append('bio', this.bio)

                try {
                    const res = await this.$axios.post('/api/user/profile/update', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })

                    if (res.data.code === 200) {
                        this.$store.commit('setUserInfo', res.data.data)
                        this.editing = false
                        window.alert('保存成功')
                    } else {
                        window.alert(res.data.message || '保存失败')
                    }
                } catch (error) {
                    console.error('更新用户信息失败:', error)
                    window.alert('保存失败，请重试')
                } finally {
                    this.loading = false
                }
            },

            getGenderText(value) {
                const option = this.genderOptions.find(opt => opt.value === value)
                return option ? option.text : '保密'
            },

            checkFollowStatus() {
                // 模拟检查是否已关注该用户
                // 在实际应用中，应该从后端获取关注状态
                this.$axios.get('/api/user/follow/status', {
                    params: { userId: this.$route.params.id } // 假设路由参数中有用户ID
                })
                    .then(res => {
                        if (res.data.code === 200) {
                            this.isFollowed = res.data.data.isFollowed
                            this.isCurrentUser = res.data.data.isCurrentUser
                        }
                    })
                    .catch(error => {
                        console.error('获取关注状态失败:', error)
                        // 模拟数据，设置为非当前用户，且未关注
                        this.isCurrentUser = false
                        this.isFollowed = false
                    })
            },

            toggleFollow() {
                if (this.isFollowed) {
                    this.unfollowUser()
                } else {
                    this.followUser()
                }
            },

            followUser() {
                // 关注用户
                this.$axios.post('/api/user/follow', {
                    followingId: this.$route.params.id // 假设路由参数中有用户ID
                })
                    .then(res => {
                        if (res.data.code === 200) {
                            this.isFollowed = true
                            this.followersCount++ // 更新粉丝数
                            this.$toast.success('关注成功')
                        }
                    })
                    .catch(error => {
                        console.error('关注用户失败:', error)
                        // 模拟成功
                        this.isFollowed = true
                        this.followersCount++ // 更新粉丝数
                    })
            },

            unfollowUser() {
                // 取消关注
                this.$axios.post('/api/user/unfollow', {
                    followingId: this.$route.params.id // 假设路由参数中有用户ID
                })
                    .then(res => {
                        if (res.data.code === 200) {
                            this.isFollowed = false
                            this.followersCount-- // 更新粉丝数
                            this.$toast.success('已取消关注')
                        }
                    })
                    .catch(error => {
                        console.error('取消关注用户失败:', error)
                        // 模拟成功
                        this.isFollowed = false
                        this.followersCount-- // 更新粉丝数
                    })
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

            openComments(post) {
                // 打开评论对话框
                this.selectedPost = post;
                this.commentDialog = true;
                this.fetchComments(post.id);
            },

            fetchComments(postId) {
                // 获取帖子评论
                this.$axios.get(`/api/posts/${postId}/comments`)
                    .then(res => {
                        if (res.data.code === 200) {
                            this.comments = res.data.data;
                        }
                    })
                    .catch(error => {
                        console.error('获取评论失败:', error);
                        // 模拟数据
                        this.comments = [
                            {
                                id: 1,
                                content: '很棒的帖子！',
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
                            authorAvatar: this.avatar || 'https://cdn.vuetifyjs.com/images/john.jpg',
                            createTime: new Date().toLocaleString()
                        };
                        this.comments.unshift(newComment);
                        this.selectedPost.comments = (this.selectedPost.comments || 0) + 1;
                        this.newComment = ''; // 清空输入框
                    });
            }
        }
    }
</script>

<style scoped>
    .profile-header {
        position: relative;
    }

    .profile-avatar {
        border: 2px solid white;
        cursor: pointer;
    }

    .v-card__title {
        word-break: normal;
        white-space: normal;
    }

    .v-tabs {
        border-bottom: 100px solid rgba(0, 0, 0, 0.12);
    }

    /* 添加新样式 */
    .profile-cover {
        position: relative;
    }

    .profile-cover .v-row {
        position: relative;
        z-index: 2;
    }

    .caption {
        font-size: 0.75rem !important;
    }

    .profile-info-row {
        position: relative;
        z-index: 5;
    }

    .content-preview {
        max-height: 60px;
        overflow: hidden;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        padding-bottom: 0;
    }
</style>