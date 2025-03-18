<template>
    <v-app>
        <v-container>
            <!-- 搜索部分 -->
                <!-- 搜索部分 -->
                <v-container d-flex class="pb-0">
                    <v-btn rounded class="mr-2 font-weight-black" color="indigo" dark @click="toggleSearchMode">
                        <v-icon left>
                            {{icon}}</v-icon>
                        {{ text}}</v-btn>
                    <div style="position: relative; width: 80%;">
                        <v-menu offset-y v-model="display" nudge-top="20" :close-on-content-click="false">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field 
                                v-model="searchContent" 
                                label="搜索景点或学校" 
                                append-icon="mdi-magnify" 
                                @input="search" v-bind="attrs"
                                clearable
                                v-on="on" outlined dense  style="width: 100%;" ></v-text-field>
                            </template>
                            <v-list>
                                <router-link to="/RoutePlan" class="text-decoration-none">
                                <v-list-item @click="sendMapId(result.mapType)" style="width: 100%;" v-for="result in items" :key="result.mapId" dense>
                                    <v-icon class="mr-3">{{result.mapType === '学校' ? 'mdi-school' : 'mdi-flower-tulip' }}</v-icon>
                                <v-list-item-title class="font-weight-bold text--secondary  mr-4">
                                    <v-row align="center" justify="space-between">
                                        <v-col cols="auto">{{ result.mapName }}</v-col>
                                        <v-col cols="auto">
                                            <v-icon small class="mr-1" >mdi-fire</v-icon>
                                        <span class="ml-1 font-weight-bold text--secondary text-caption mr-2">{{ String(result.population).padEnd(2, ' ')
                                            }}</span>
                                            <v-icon small class="mr-1" >mdi-thumb-up</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary text-caption mr-2" >{{ result.score.toFixed(2)}}</span>
                                        </v-col>
                                    </v-row>
                                </v-list-item-title>
                                    <v-list-item-subtitle v-html="highlightSearchQuery(result.description)"></v-list-item-subtitle>
                                    <!-- <v-list-item-content>{{ result.description.substring(0, 10) }}</v-list-item-content> -->
                                    <!-- 添加更多搜索结果的详细信息 -->
                                </v-list-item>
                                </router-link>
                            </v-list>
                        </v-menu>
                    </div>
                </v-container>

            <!-- 推荐部分 -->
            <v-container pt-0>
            <v-chip-group column active-class="indigo--text" v-model="selectedFilters" mandatory>
                <v-chip filter outlined>热度</v-chip>
                <v-chip filter outlined>评价</v-chip>
            </v-chip-group>

                <!-- 卡片展示 -->
                <v-container>
                    <v-row>
                        <v-col v-for="item in items" :key="item.mapId" cols="4">
                            <v-card hover>
                                <v-img :src=item.imageId height="200px" cover></v-img>
                                <v-card-title class="font-weight-bold mx-1">{{ item.mapName }}
                                    <v-chip class="ml-2" color="indigo" small text-color="white">{{item.mapType}}</v-chip>
                                </v-card-title>
                                <v-card-text class="description-clamp-2">{{ item.description }}</v-card-text>
                                <v-card-actions class="d-flex justify-space-between">
                                    <div class="d-flex">
                                        <div>
                                            <v-icon color="orange">mdi-fire</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{ item.population }}</span>
                                        </div>
                                        <div class="ml-2">
                                            <v-icon color="indigo">mdi-thumb-up</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{ item.score.toFixed(2)}}</span>
                                        </div>
                                        <div class="ml-1">
                                            <v-icon color="red">mdi-map-marker</v-icon>
                                            <span class="ml-1 font-weight-bold text--secondary">{{item.countryRegion}}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <router-link to="/RoutePlan">
                                            <v-btn rounded class="transparent-btn text--secondary font-weight-bold text-decoration-none"
                                                elevation=0 @click="sendMapId(item.mapType)">去游学<v-icon color="gray" class="ml-1" right>mdi-chevron-right</v-icon></v-btn>
                                        </router-link>
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
            isSchool: 2,
            searchContent: '', // 搜索内容
            searchResults: [], // 用于存储搜索结果的数组
            items:[],
            selectedFilters:0, 
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
                    return this.selectedFilters === 0 ? 'population' : 'score';
                },
              searchType() {
               switch (this.isSchool) {
                   case 0: return '学校';
                   case 1: return '景点';
                   case 2: return ''; // 当 isSchool 为 2 时，searchType 为空字符串
                   default: return '';
               }
            },
            icon() {
               switch (this.isSchool) {
                   case 0: return 'mdi-school';
                   case 1: return 'mdi-flower-tulip';
                   case 2: return 'mdi-search-web'; // 替换为您的默认图标
                   default: return '';
               }
           },
           text() {
               switch (this.isSchool) {
                   case 0: return '搜索学校';
                   case 1: return '搜索景点';
                   case 2: return '默认搜索'; // 替换为您的默认文本
                   default: return '';
               }
            },
            },
         watch: {
                    orderType(newVal) {
                        console.log('orderType:', newVal);
                        this.$axios.post('http://10.129.37.114:8321/search', {
                            orderType: newVal,
                            searchType: this.searchType, // 使用searchType作为景点类别参数
                            searchContent: this.searchContent, // 使用searchContent作为搜索内容参数
    
                        })
                            .then(response => {
                                // 将获取到的数据存储在 items 数组中
                                this.items = response.data.data;
                                console.log('从后端返回的数据:', response.data.data);
                                console.log('searchContent:', this.searchContent);
                                console.log('searchType:', this.searchType);
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
                    url: 'http://10.129.37.114:8321/search', // 替换为实际的接口地址
                    data: {
                        orderType: this.orderType, // 使用orderType作为排序方式参数
                        searchType: this.searchType, // 使用searchType作为景点类别参数
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
            sendMapId(mapType) {
                let mapId;
                // 根据 mapType 的值决定 mapId
                switch (mapType) {
                    case '学校':
                        mapId ="8";
                        break;
                    case '景点':
                        mapId ="9";
                        break;
                    // 添加更多的 case 来处理不同的 mapType
                    default:
                        mapId ="8";
                }
            //  this.$axios.get('http://10.129.37.114:8321/getMapMassage', { params: { mapId: mapId } })
            //         .then(response => {
            //             // 将数据存储在变量中以便重用
            //             const routeData = {
            //                 data: JSON.stringify(response.data),
            //                 mapId: JSON.stringify(mapId)
            //             };

            //             // 使用 router.push 方法跳转到 /RoutePlan 页面，并传递参数
            //             this.$router.push({ path: '/RoutePlan', query: routeData });

            //             // 同时使用 router.push 方法跳转到 /PlaceSearch 页面，并传递相同的参数
            //             this.$router.push({ path: '/PlaceSearch', query: routeData });

            //             console.log('后端数据成功得到');
            //             console.log('mapId:', mapId);
            //         })
            //         .catch(error => {
            //             console.error('请求错误:', error);
            //         });
            // },
           this.$axios.get('http://10.129.37.114:8321/getMapMassage', { params: { mapId: mapId } })
                    .then(response => {
                        // 直接将响应数据存储在 Vuex 的 state 中
                        this.$store.commit('setRouteData', {
                            data: response.data, // 直接存储对象，不使用 JSON.stringify
                            mapId: mapId        // 直接存储 mapId
                        });

                        console.log('后端数据成功得到', response.data);
                        console.log('mapId:', mapId);
                    })
                    .catch(error => {
                        console.error('请求错误:', error);
                    });
            },
                highlightSearchQuery(content) {
                const index = content.indexOf(this.searchContent);
                if (index === -1) {
                    return content;
                }

                const start = Math.max(0, index - 20); // 获取上下文
                const end = Math.min(content.length, index + this.searchContent.length + 40); // 获取上下文
                const highlighted = `<strong>${this.searchContent}</strong>`; // 加粗搜索查询

                return content.slice(start, index) + highlighted + content.slice(index + this.searchContent.length, end);
            },
            // 其他方法...
            selectResult(result) {
                // 处理选中搜索结果的逻辑
                console.log('选中的搜索结果:', result);
                // 可以跳转到详情页等
            },
            toggleSearchMode() {
                 this.isSchool = (this.isSchool + 1) % 3; // 循环切换状态
            },
            hideList() {
                this.display = false;
                // Implement your search logic here based on the current value of `isHot`
            },
            mounted() {
                console.log(this.orderType);
                console.log('selectedFilters:', this.selectedFilters);
                console.log('items:', this.items);
            },
    },
        
        created() {
                // 在组件创建后获取数据
                this.$axios.post('http://10.129.37.114:8321/search', {
                     orderType: this.orderType,
                     searchType: this.searchType, // 使用searchType作为景点类别参数
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