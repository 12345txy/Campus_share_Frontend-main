<template>
    <v-app>
        <v-container>
            <!-- 搜索部分 -->
            <v-container d-flex class="pb-0">
                <v-btn rounded class="mr-2 font-weight-black" color="indigo" dark @click="toggleSearchMode">
                    <v-icon left>
                        {{ isHot ?'mdi-fire' : 'mdi-marker-check'}}</v-icon>
                    {{ isHot ?'热度' : '评分' }}</v-btn>
                <div style="position: relative; width: 80%;">
                <v-menu offset-y v-model="display" nudge-top="20" close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="searchQuery" label="搜索游学日记" append-icon="mdi-magnify" @input="search" v-bind="attrs"
                            clearable v-on="on" outlined dense></v-text-field>
                    </template>
                    <v-list>
                        <router-link to="/RoutePlan" class="text-decoration-none">
                            <v-list-item v-for="result in searchResults" :key="result.id" @click.stop="selectResult(result)">
                                <v-icon class="mr-3">mdi-notebook</v-icon>
                                <v-list-item-title>{{ result.title }}</v-list-item-title>
                            <v-list-item-subtitle v-html="highlightSearchQuery(result.content)"></v-list-item-subtitle>
                            </v-list-item>
                        </router-link>
                    </v-list>
                </v-menu>

                </div>
            </v-container>

            <!-- 推荐部分 -->
            <v-container pt-0>
                <v-chip-group column active-class="indigo--text" v-model="sortKey" mandatory>
                    <v-chip filter outlined value="heatness">热度</v-chip>
                    <v-chip filter outlined value="rating">评分</v-chip>
                </v-chip-group>
                <!-- 卡片展示 -->
                <v-container>
                    <v-row>
                        <v-col v-for="diary in sortedDiaries" :key="diary.id" cols="4">
                            <v-card hover>
                                <v-card-title class="font-weight-bold">{{ diary.title }}</v-card-title>
                                <v-subtitle class="font-weight-bold">
                                    <v-row justify="space-between"> <!-- 添加这一行 -->
                                        <v-col cols="auto"> <!-- 添加这一行 -->
                                            <v-icon class="ml-3" left color="indigo">mdi-account</v-icon>{{ diary.author }}
                                        </v-col> <!-- 添加这一行 -->
                                        <v-col cols="auto"> <!-- 添加这一行 -->
                                            <v-icon color="red">mdi-map-marker</v-icon>
                                            <span class="mr-3 font-weight-bold">{{ diary.location }}</span>
                                        </v-col> <!-- 添加这一行 -->
                                    </v-row> <!-- 添加这一行 -->
                                </v-subtitle>
                                <v-divider class="mx-15 mt-3"></v-divider>
                            <v-card-text :class="{ 'description-clamp-2': !expandedDiaries[diary.id] }">
                                {{ diary.content }}
                            </v-card-text>
                            <v-card-text class="pl-2 font-weight-black deep-orange--text mt-0" v-show="expandedDiaries[diary.id]">
                                评分：
                            <v-rating v-model="rating" background-color="grey darken-1" empty-icon="$ratingFull" color="yellow accent-4" dense half-increments hover size="20" class="ml-0"></v-rating></v-card-text>
                                <v-card-actions class="mt-3">
                                    <v-row class="d-flex justify-space-between">
                                        <div class="d-flex">
                                            <div class="ml-2">
                                                <v-icon color="orange">mdi-fire</v-icon>
                                                <span class="ml-1 font-weight-bold text--secondary">{{ diary.heatness }}</span>
                                            </div>
                                            <div class="ml-2">
                                                <v-icon color="deep-orange">mdi-thumb-up</v-icon>
                                                <span class="ml-1 font-weight-bold text--secondary">{{ diary.rating }}</span>
                                            </div>
                                        </div>
                                        <div>
                                                <v-btn class="transparent-btn text--secondary font-weight-bold text-decoration-none mr-2 mb-1"
                                                    elevation=0 @click="toggleDiary(diary.id)" >{{ expandedDiaries[diary.id] ? '收起全文' : '阅读全文'}}<v-icon color="gray" class="ml-1" right>mdi-chevron-right</v-icon>
                                                </v-btn>
                                        </div>
                                    </v-row>
                                    
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
            <router-link to="/DiaryEdit">
            <v-btn class="fixed-button" large color="indigo" dark fab>
            <v-icon>mdi-pencil</v-icon>
        </v-btn>
        </router-link>
        </v-container>
    </v-app>
</template>

<script>
    export default {
        data: () => ({
            isHot1:'heatness',
            isHot: true,
            sortKey: 'heatness', // 默认按热度排序
            searchQuery: '',
            searchResults1:[],
            diaries: [
                { id: 1, title: '清华园的春天',author:'Azr', content: '今天，我踏入了著名的清华园，春意盎然，百花齐放。一进入校园，就被那股浓郁的学术氛围和历史沉淀所吸引。清华园不仅是学问的殿堂，更是自然美景的汇聚地。清晨，我沿着曲径通幽的小路漫步，两旁的樱花树如云似霞，粉白色的花瓣随风飘落，像是天空中飘洒的雪花。我不禁停下脚步，仰头欣赏这场春天的雪。午后，我来到了紫荆广场，广场上学生们的活力与这春日的暖阳相得益彰。一群学生在草坪上讨论着学术问题，他们的声音充满了对知识的渴望和对未来的憧憬。傍晚时分，我漫步至清华大学的水木清华园，那里的景色宁静而又和谐。水面波光粼粼，倒映着夕阳的余晖。几只野鸭戏水，搅动起一圈圈涟漪。夜幕降临，清华园依旧灯火通明，图书馆里传来窸窸窣窣的书页翻动声。我在这里感受到了学术的严谨与深邃，也感受到了春天的生机与希望。这一天的游学体验，让我深深地被清华园的春天所打动。在这里，每一步都能感受到历史与现代的交融，每一次呼吸都充满了知识的芬芳。清华园的春天，不仅是自然界的盛宴，更是心灵的洗礼。明天，我将继续我的探索之旅，期待在清华园的每个角落都能发现新的惊喜。', location: '清华大学', rating: 4.8,heatness:100},
                { id: 2, title: '北大的秋日',author:'Txy',content: '今天，我漫步在北京大学的校园里，感受着秋天的气息。秋风送爽，阳光和煦，北大的秋日如同一幅精致的画卷，缓缓展开在我的眼前。清晨，我穿过了拥有百年历史的博雅塔，它静静地伫立在悠长的时光里。落叶在轻风中飘落，铺成了一条金黄色的道路。我踏着这条道路，仿佛走进了历史的长河。午后，我来到了未名湖边，湖水清澈见底，湖面上漂浮着几片落叶，宛如画家笔下的点缀。我坐在湖边的长椅上，看着对岸的博雅塔倒映在水中，心中涌起一股宁静。傍晚，我在未名湖旁的草地上找到了一片空地，与朋友们一起享受着秋日的温暖。我们谈论着未来的梦想，讨论着学术的疑惑，周围的景色让这一切显得更加美好。夜幕降临，我在图书馆的窗前静静地站了很久。图书馆的灯光如同星星一般点缀在夜空中，学子们依旧埋头于书海，追寻着知识的光芒。北大的秋日，给了我无限的遐想和灵感。在这里，我不仅学到了知识，更感受到了生活的美好。秋天的北大，是一个充满诗意和智慧的地方，我将这一天的记忆珍藏在心底。明天，我还会继续在这片充满智慧的土地上探索，希望能在这个秋天，收获更多的知识和美好的回忆。', location: '北京大学', rating: 4.9,heatness:80 },
                { id: 3, title: '北师的冬日',author:'Yyj',content: '今天，我踏入了北京师范大学，这里的冬日别有一番风味。虽然寒风凛冽，但校园里依然充满了温暖的气息。清晨，我穿过校园的主道，两旁的枯树在冬日的阳光下显得格外坚韧。雪花轻轻飘落，覆盖了整个校园一层洁白的银装，让北师的每一角落都变得如诗如画。午后，我来到了图书馆前的广场，看到学生们不畏严寒，或聚在一起讨论学术，或独自沉浸在书本世界中。他们的身影在雪地上拉出了长长的影子，仿佛是冬日里最美的风景。傍晚，我沿着校园内的小路漫步，路过一片被雪覆盖的草坪。几个孩子在那里堆雪人，欢声笑语在寒风中飘扬，让人忘却了冬日的寒冷。夜幕降临，北师的灯光亮起，温暖而又明亮。我在教学楼前停下脚步，远处传来了朗朗的读书声，那是北师学子们对知识的执着追求。北师的冬日，虽然没有了春花的绚烂，夏叶的繁茂，秋果的丰硕，但有了冬雪的纯洁和学子们的热情。在这里，我感受到了北师独特的学术氛围和生活的节奏。明天，我将继续在这片充满活力的土地上探索，希望能在这个冬天，收获更多的知识和温暖的回忆。', location: '北京师范大学', rating: 5,heatness:60},
                { id: 4, title: '北邮的夏日',author:'Gqh',content: '今天，我来到了北京邮电大学，这里的夏日充满了青春的活力和科技的气息。阳光明媚，微风不燥，北邮的校园里洋溢着夏天的热情。清晨，我在校园里散步，看到学生们或是在晨跑，或是在图书馆前讨论着学术问题。校园里的每个角落都充满了朝气蓬勃的氛围。午后，我参观了北邮的实验室，见证了学生们如何利用先进的科技进行创新研究。他们专注的神情和不断尝试的精神让我深受感动。傍晚，我来到了学校的运动场，看到学生们在进行各种体育活动，篮球场上，球员们奋力拼搏，汗水与阳光交织成了夏日最美的风景。夜晚，我在宿舍区散步，轻风带来了一丝凉意，学生们三三两两地坐在长椅上，享受着夏夜的宁静。北邮的夏日，是充满希望和梦想的。在这里，我不仅感受到了知识的力量，也感受到了青春的热情。明天，我将继续探索这个充满活力的校园，期待能发现更多的故事和灵感。', location: '北京邮电大学', rating: 4.2 ,heatness:40},
                 {
    "id": 5,
    "title": "人民大学的晨曦",
    "author": "Lxy",
    "content": "清晨的中国人民大学格外宁静，阳光透过树梢，洒在我脸上，带来一丝温暖。我在校园里慢跑，感受着新的一天的开始。学生们陆续走出宿舍，开始他们忙碌的一天。图书馆前，已有人在等待开门，准备投入到知识的海洋中。午后的阳光照在图书馆的台阶上，学生们坐在那里，享受着温暖的阳光，讨论着学术问题。我在校园的每个角落都能感受到知识的力量和学生们的活力。夜晚，我参加了一个学术讲座，教授们的见解深刻，学生们的提问尖锐，让我受益匪浅。在人民大学的每一天，都是充满学习和发现的一天。",
    "location": "中国人民大学",
    "rating": 3.4,
    "heatness": 50
  },
  {
    "id": 6,
    "title": "中央民族大学的多彩午后",
    "author": "Wzh",
    "content": "中央民族大学的校园里，各种民族的文化交织在一起，形成了一道独特的风景。午后的阳光下，学生们身着各自民族的服饰，展示着他们丰富多彩的文化。我在这里学习到了不同民族的历史和习俗，感受到了中国文化的博大精深。图书馆里，书架上摆满了关于民族文化的书籍，我在那里度过了一个下午，沉浸在书海中。晚上，我参加了一个民族音乐会，音乐优美动听，让我仿佛置身于一个多彩的世界。",
    "location": "中央民族大学",
    "rating": 4.0,
    "heatness": 70
  },
  {
    "id": 7,
    "title": "北航的科技梦",
    "author": "Zj",
    "content": "在北京航空航天大学，我被这里的创新精神和科技氛围所吸引。学生们在实验室里忙碌着，他们的眼中闪烁着对未来的憧憬。无人机在天空中飞翔，仿佛在诉说着北航学子们的科技梦。图书馆里，我看到了许多关于航空航天的专业书籍，学生们认真地阅读着，不时地进行讨论。晚上，我在学校的观星台上，看着满天的星辰，感受着宇宙的浩瀚和人类探索的勇气。",
    "location": "北京航空航天大学",
    "rating": 3.2,
    "heatness": 85
  },
  {
    "id": 8,
    "title": "北理工的创造力",
    "author": "Mm",
    "content": "北京理工大学的校园里，处处可见学生们的创造力和实践能力。他们在制作机器人，参与国际比赛，展示着他们的才华。我在这里感受到了工程学的魅力，以及将理论知识转化为实践的重要性。实验室里，学生们正在研究新型材料，他们的热情和专注让我深受感染。晚上，我在学校的创新中心里，看到了学生们为了完成他们的项目而通宵达旦的努力。",
    "location": "北京理工大学",
    "rating": 4.5,
    "heatness": 65
  },
  {
    "id": 9,
    "title": "北外的语言之旅",
    "author": "Qx",
    "content": "在北京外国语大学，我仿佛踏上了一场世界语言的旅行。校园里，不同国家的语言交织在一起，形成了一幅美妙的交响乐。学生们热情地交流着，用他们流利的多国语言，让我感受到了语言学习的乐趣。图书馆的外语区域里，我发现了各种各样的语言学习资料，从书籍到音频，应有尽有。晚上，我参加了一个国际文化交流活动，学生们分享了他们的留学经历和文化体验，让我开阔了眼界",
    "location": "北京外国语大学",
    "rating": 5.0,
    "heatness": 55
  },
  {
    "id": 10,
    "title": "北师大的文学之夜",
    "author": "Lh",
    "content": "北京师范大学的夜晚，我参加了一场文学讲座。教授们的讲解深入浅出，学生们的讨论热烈而有见地。在这里，我感受到了文学的力量，以及它在人类文明中的重要地位。",
    "location": "北京师范大学",
    "rating": 2.8,
    "heatness": 75
  },
  {
    "id": 11,
    "title": "北工大的工匠精神",
    "author": "Zy",
    "content": "在北京工业大学，我看到了学生们的工匠精神。他们在工作坊里精心打造着各种作品，每一个细节都力求完美。这里的学习氛围让我深受感染，也激发了我对工程技术的兴趣。",
    "location": "北京工业大学",
    "rating": 3.8,
    "heatness": 60
  },
  {
    "id": 12,
    "title": "北交大的交通梦",
    "author": "Wx",
    "content": "北京交通大学是交通工程的摇篮。我参观了他们的铁道博物馆，了解了中国铁路的发展历史。学生们在模拟驾驶室里操作着，体验着驾驶列车的快感。这里的学习不仅是理论，更多的是实践。",
    "location": "北京交通大学",
    "rating": 3.0,
    "heatness": 50
  },
  {
    "id": 13,
    "title": "北农的绿色未来",
    "author": "Hj",
    "content": "在中国农业大学，我被这里的绿色科技所吸引。学生们在田间地头实践着，研究着如何让农作物更加健康地成长。这里的学习是为了未来的食品安全和可持续发展。",
    "location": "中国农业大学",
    "rating": 4.2,
    "heatness": 70
  },
  {
    "id": 14,
    "title": "北中医的健康之道",
    "author": "Lw",
    "content": "在北京中医药大学，我学习了中医的智慧。学生们在实验室里研制中药，探索着古老医学与现代科技的结合。在这里，我感受到了中医对健康的深刻理解，以及它在现代社会中的价值。",
    "location": "北京中医药大学",
    "rating": 4.4,
    "heatness": 80
  },
  {
    "id": 15,
    "title": "北邮",
    "author": "Txy",
    "content": "北京邮电大学",
    "location": "北京邮电大学",
    "rating": 0,
    "heatness": 0
  }
                

                // 初始化您的游学日记数据数组
            ],
            display: false, // 新增的变量
            expandedDiaries: {}, // 初始化为空对象
        }),
        computed: {
                    sortedDiaries() {
                        // 创建一个diaries数组的副本，以避免副作用
                        const diariesCopy = [...this.diaries];
                        // 根据sortKey的值对diariesCopy进行排序
                        return diariesCopy.sort((a, b) => b[this.sortKey] - a[this.sortKey]);
                    },
                searchResults() {
                // 创建一个diaries数组的副本，以避免副作用
                const diariesCopy = [...this.searchResults1];
                // 根据sortKey的值对diariesCopy进行排序
                return diariesCopy.sort((a, b) => b[this.isHot1] - a[this.isHot1]);
            },
            userdiary() {
      // 从Vuex store获取日记数据
            return this.$store.state.diary;
            }
                },
          mounted() {
                    // 页面加载时，初始化每个日记的展开状态为false
                    this.diaries.forEach(diary => {
                        this.$set(this.expandedDiaries, diary.id, false);
                    });
                    // 在方法中更新diaries状态
                    // this.diaries = { ...this.diaries, ...this.userdiary(
                    console.log('userdiary:',this.userdiary)
                },
        methods: {
              
              toggleDiary(diaryId) {
                // 切换指定日记的展开状态
                this.$set(this.expandedDiaries, diaryId, !this.expandedDiaries[diaryId]);
                console.log(this.expandedDiaries[diaryId]);
                console.log('expandedDiaries:', this.expandedDiaries);
                
              },
              search() {
                let results = [];

                // 按标题搜索
                for (let diary of this.diaries) {
                    if (diary.title.includes(this.searchQuery)) {
                        results.push(diary);
                    }
                }

                // 按内容搜索
                for (let diary of this.diaries) {
                    if (diary.content.includes(this.searchQuery)) {
                        // 检查结果是否已经包含这个日记
                        if (!results.includes(diary)) {
                            results.push(diary);
                        }
                    }
                }

                this.searchResults1 = results;
            },
            highlightSearchQuery(content) {
                const index = content.indexOf(this.searchQuery);
                if (index === -1) {
                    return content;
                }

                const start = Math.max(0, index - 10); // 获取上下文
                const end = Math.min(content.length, index + this.searchQuery.length + 10); // 获取上下文
                const highlighted = `<strong>${this.searchQuery}</strong>`; // 加粗搜索查询

                return content.slice(start, index) + highlighted + content.slice(index + this.searchQuery.length, end);
            },
            selectResult(result) {
                // 处理选中搜索结果的逻辑
                console.log('选中的搜索结果:', result);
                // 可以跳转到详情页等
            },
            toggleSearchMode() {
                this.isHot = !this.isHot;
                this.isHot1=this.isHot?'heatness':'rating';
                // Implement your search logic here based on the current value of `isHot`
            },
            beforeDestroy() {
                // 在Vue实例销毁前，移除全局的click事件监听器
                document.removeEventListener('click', this.hideList);
            },
            hideList(event) {
                // 检查点击事件是否发生在搜索结果列表或搜索框之外
                if (this.$refs.searchList && !this.$refs.searchList.$el.contains(event.target) && !this.$refs.searchInput.$el.contains(event.target)) {
                    this.display = false;
                }
            },
        }
    }
</script>

<style>
    .description-clamp-2 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp:2;
        overflow: hidden;
    }

    .transparent-btn {
        background-color: transparent !important;
        border-color: transparent !important;
    }
      .fixed-button {
        position: fixed;
        right: 150px;
        bottom: 150px;
    }
</style>