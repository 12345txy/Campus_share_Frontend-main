<template>
    <v-app>
        <v-container>
            <!-- 搜索部分 -->
            <v-chip-group dense v-model="selection" active-class="indigo--text text--accent-4 font-weight-black" mandatory
                                center-active show-arrows>
                                <v-chip v-for="filter in filters" :key="filter" :value="filter">
                                    {{ filter}}
            </v-chip>
            </v-chip-group>
            <v-container d-flex class="pb-0">
                <div style="position: relative; width: 100%;">
                    <v-menu offset-y v-model="display" nudge-top="20" :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="searchContent" label="搜索美食" placeholder="来一场美食之旅" append-icon="mdi-magnify"
                                @input="search" v-bind="attrs" clearable v-on="on" outlined dense
                                style="width: 100%;"></v-text-field>
                            </template>
                        <v-list>
                                <v-list-item  style="width: 100%;"
                                    v-for="result in items" :key="result.foodId" dense>
                                    <v-icon class="mr-3">mdi-food-turkey</v-icon>
                                    <v-list-item-title class="font-weight-bold text--secondary  mr-4">
                                        <v-row align="center" justify="space-between">
                                            <v-col cols="auto">{{ result.name }}</v-col>
                                            <v-col cols="auto">
                                                <v-icon small class="mr-1">mdi-fire</v-icon>
                                                <span class="ml-1 font-weight-bold text--secondary text-caption mr-2">{{
                                                    String(result.population).padEnd(2, ' ')
                                                    }}</span>
                                                <v-icon small class="mr-1">mdi-thumb-up</v-icon>
                                                <span class="ml-1 font-weight-bold text--secondary text-caption mr-2">{{
                                                    result.score.toFixed(2)}}</span>
                                            </v-col>
                                        </v-row>
                                    </v-list-item-title>
                                    <!-- <v-list-item-content>{{ result.description.substring(0, 10) }}</v-list-item-content> -->
                                    <!-- 添加更多搜索结果的详细信息 -->
                                </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </v-container>

            <!-- 推荐部分 -->
            <v-container pt-0>
                <v-chip-group column active-class="indigo--text" v-model="selectedFilters" mandatory>
                    <v-chip filter outlined value="population">热度</v-chip>
                    <v-chip filter outlined value="score">评价</v-chip>
                    <v-chip filter outlined value="distance">距离</v-chip>
                </v-chip-group>

                <!-- 卡片展示 -->
                <v-container>
                    <v-row>
                        <v-col v-for="item in items" :key="item.foodId" cols="4">
                            <v-card hover>
                                <v-img :src=item.imageUrl height="200px" cover></v-img>
                                <v-card-title class="font-weight-bold mx-1">{{ item.name}}
                                    <v-chip class="ml-2" color="indigo" small
                                        text-color="white">{{item.style}}</v-chip>
                                </v-card-title>
                                <v-card-subtitle>
                                            <v-icon color="red">mdi-map-marker</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{item.restaurantName}}</span>
                                            <v-icon color="brown">mdi-foot-print</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{item.distance}}m</span>
                                </v-card-subtitle>
                                <v-card-actions class="d-flex justify-space-between">
                                    <div class="d-flex">
                                        <div> 
                                            <v-icon color="orange">mdi-fire</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{ item.population
                                                }}</span>
                                        </div>
                                        <div class="ml-2">
                                            <v-icon color="indigo">mdi-thumb-up</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{
                                                item.score.toFixed(2)}}</span>
                                        </div>
                                    </div>
                                    <div>
                                            <v-btn rounded
                                                class="transparent-btn text--secondary font-weight-bold text-decoration-none"
                                                elevation=0 @click="sendMapId(item.mapType)">尝一尝<v-icon color="gray"
                                                    class="ml-1" right>mdi-chevron-right</v-icon></v-btn>
                                    </div>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-container>
    </v-app>
</template>

<script>
    export default {
        data: () => ({
            searchContent: '', // 搜索内容
            searchResults: [], // 用于存储搜索结果的数组
            items: [],
            selectedFilters: 0,
            selection: '不限',
            filters: [
                    '不限','美式快餐','中式面食','日式料理','意大利菜','中式小吃','咖啡','川菜','鲁菜','粤菜','湘菜','淮扬菜','闽菜','浙菜','徽菜','豫菜','烧烤'
            ],
            // items: [
            //     { id: 1, name: '清华大学', description: '五道口男子技校', type:'学校',location:'北京',image: "https://img.saihuitong.com/2900/img/104581/large/18b6b32a8fe.jpg",heatness: 100, rating: 98},
            //     { id: 2, name: '北京大学', description: '中关村文理学院', type: '学校',location: '北京',image: "/assets/Peking.jpg " ,heatness: 50, rating: 97},
            //     { id: 3, name: '北京师范大学', description: '北师北邮一家亲',  type: '学校', location: '北京',image: "/assets/beishi.jpg",heatness: 75, rating:96},
            //     { id: 4, name: '北京邮电大学', description: '信息黄埔，邮兵出击', type: '学校', location: '北京',image: "/assets/beiyou.jpg" ,heatness: 80, rating:95},
            //     { id: 5, name: '故宫', description: '世界五大宫之首',  type: '景点', location: '北京',image: "/assets/gugong.webp",heatness: 90, rating:94},
            //     { id: 6, name: '颐和园', description: '我爱北京颐和园',  type: '景点', location: '北京',image: "/assets/yiheyuan.webp",heatness: 90, rating:94},
            //     // 初始化您的景点和学校数据数
            // ],
            display: false, // 新增的变量
        }),
        computed: {
            orderType: function () {
                return this.selectedFilters;
            },
        },
        watch: {
            orderType(newVal) {
                console.log('orderType:', newVal);
                this.$axios.post('http://10.129.37.114:8321/searchFood', {
                    orderType: newVal,
                    searchStyle: this.selection==='不限'?'':this.selection, // 使用searchType作为景点类别参数
                    searchContent: this.searchContent, // 使用searchContent作为搜索内容参数

                })
                    .then(response => {
                        // 将获取到的数据存储在 items 数组中
                        this.items = response.data.data;
                        console.log('从后端返回的数据:', response.data.data);
                        console.log('searchContent:', this.searchContent);
                        console.log('searchStyle:', this.selection);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
             selection(newVal) {
                console.log('orderType:', newVal);
                this.$axios.post('http://10.129.37.114:8321/searchFood', {
                    orderType: newVal,
                    searchStyle: this.selection==='不限'?'':this.selection, // 使用searchType作为景点类别参数
                    searchContent: this.searchContent, // 使用searchContent作为搜索内容参数

                })
                    .then(response => {
                        // 将获取到的数据存储在 items 数组中
                        this.items = response.data.data;
                        console.log('从后端返回的数据:', response.data.data);
                        console.log('searchContent:', this.searchContent);
                        console.log('searchStyle:', this.selection);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            selectedFilters(newVal) {
                console.log('selectedFilters:', newVal);
            },
            // ...你的其他监听器...
        },
        methods: {
            search() {
                // 发起搜索请求
                this.$axios({
                    method: 'post',
                    url: 'http://10.129.37.114:8321/searchFood', // 替换为实际的接口地址
                    data: {
                        orderType: this.orderType, // 使用orderType作为排序方式参数
                        searchStyle: this.selection==='不限'?'':this.selection, // 使用searchType作为景点类别参数
                        searchContent: this.searchContent, // 使用searchContent作为搜索内容参数
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(res => {
                    // 处理响应数据
                    if (res.data.code === '0') {
                        this.items = res.data.data; // 更新items数组
                        console.log(this.items);
                    } else {
                        window.alert('搜索失败，请重试');
                    }
                }).catch(function (error) {
                    console.log(error);
                })
            },
            // 其他方法...
            selectResult(result) {
                // 处理选中搜索结果的逻辑
                console.log('选中的搜索结果:', result);
                // 可以跳转到详情页等
            },
            hideList() {
                this.display = false;
                // Implement your search logic here based on the current value of `isHot`
            },
           
        },
        mounted() {
                console.log('orderType:',this.selection);
                console.log('selectedFilters:', this.selectedFilters);
                console.log('items:', this.items);
        },
        created() {
            console.log('orderType:',this.selection);
            // 在组件创建后获取数据
            this.$axios.post('http://10.129.37.114:8321/searchFood', {
                orderType: this.orderType,
                searchStyle: this.selection==='不限'?'':this.selection, // 使用searchType作为景点类别参数
                searchContent: this.searchContent, // 使用searchContent作为搜索内容参数
            })
                .then(response => {
                    // 将获取到的数据存储在 items 数组中
                    this.items = response.data.data;
                    // console.log('从后端返回的数据:', response.data.data);
                })
                .catch(error => {
                    console.error(error);
                });
        },
    }
</script>

<style>
    .description-clamp-2 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }

    .transparent-btn {
        background-color: transparent !important;
        border-color: transparent !important;
    }
</style>