<template>
  <v-container fluid>
    <!-- 概览数字卡片 -->
    <v-row>
      <v-col cols="12" sm="4" v-for="(item, index) in overviewCards" :key="index">
        <v-card outlined>
          <v-card-title>
            <v-icon class="mr-2">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-card-title>
          <v-card-text>
            总数：{{ item.total }} <br />
            今日新增：{{ item.today }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 趋势图 -->
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            趋势统计
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="trendType" dense>
              <v-btn value="user">用户</v-btn>
              <v-btn value="post">帖子</v-btn>
              <v-btn value="comment">评论</v-btn>
            </v-btn-toggle>
            <v-btn-toggle v-model="range" dense>
              <v-btn value="day">日</v-btn>
              <v-btn value="week">周</v-btn>
              <v-btn value="month">月</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <div ref="trendChart" style="width: 100%; height: 400px;"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 热门帖子 -->
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>热门帖子</v-card-title>
          <v-data-table :headers="hotHeaders" :items="hotPosts" class="elevation-1"></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'AdminStatistics',
  data() {
    return {
      overviewCards: [],
      trendType: 'user',
      range: 'day',
      trendChart: null,
      trendData: {
        dates: [],
        values: []
      },
      hotPosts: [],
      hotHeaders: [
        { text: '标题', value: 'title' },
        { text: '作者', value: 'author' },
        { text: '点赞数', value: 'likeCount' },
        { text: '评论数', value: 'commentCount' },
      ],
    };
  },
  watch: {
    trendType() {
      this.fetchTrendData();
    },
    range() {
      this.fetchTrendData();
    }
  },
  mounted() {
    this.fetchOverview();
    this.fetchTrendData();
    this.fetchHotPosts();
    this.trendChart = echarts.init(this.$refs.trendChart);
  },
  methods: {
    fetchOverview() {
      this.$axios.get('/admin/stats/overview').then(res => {
        const data = res.data.data;
        this.overviewCards = [
          { title: '用户', total: data.userTotal, today: data.userToday, icon: 'mdi-account-group' },
          { title: '帖子', total: data.postTotal, today: data.postToday, icon: 'mdi-post' },
          { title: '评论', total: data.commentTotal, today: 0, icon: 'mdi-comment' },
        ];
      });
    },
    fetchTrendData() {
      this.$axios.get('/admin/stats/trend', {
        params: {
          type: this.trendType,
          range: this.range
        }
      }).then(res => {
        const data = res.data.data;
        this.trendData = data;
        this.renderTrendChart();
      });
    },
    renderTrendChart() {
      this.trendChart.setOption({
        title: { text: `${this.trendType}趋势` },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: this.trendData.dates },
        yAxis: { type: 'value' },
        series: [{
          data: this.trendData.values,
          type: 'line'
        }]
      });
    },
    fetchHotPosts() {
      this.$axios.get('/admin/stats/hot-posts', {
        params: { sort: 'like', limit: 10 }
      }).then(res => {
        this.hotPosts = res.data.data;
      });
    }
  }
};
</script>

<style scoped>
</style>
