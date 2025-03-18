<template>
    <v-app>
    <v-card class="mb-8" hover dense>
        <v-form>
            <v-row class="mx-3 mt-3">
                <v-col cols="2" class="align-self-center">
                    <v-text-field  outlined rounded dense small class="ml-0" label="当前位置" v-model="startSelectedNode"
                        prepend-inner-icon="mdi-map-marker"></v-text-field>
                </v-col>
                <!-- <v-col cols="2" class="align-self-center">
                    <v-text-field outlined  rounded dense small class="ml-2" label="单个目标景点" v-model="finalSelectedNode"
                        prepend-inner-icon="mdi-map-marker"></v-text-field>
                </v-col> -->
                <!-- <v-spacer></v-spacer> -->
                <v-col cols="5" class="align-self-center">
                    <v-text-field outlined rounded dense small class="ml-2" label="目的地" v-model="finalSelectedNode" clearable
                        prepend-inner-icon="mdi-map-marker" placeholder="输入多个景点请以空格分隔"></v-text-field>
                </v-col>
                <v-btn rounded class="mr-2 font-weight-black align-self-center" color="indigo" dark  @click="orderedTour">
                    <v-icon>mdi-navigation-variant</v-icon>顺序游览
                </v-btn>
                <v-btn rounded class="mr-2 font-weight-black align-self-center" color="indigo" dark  @click="unorderedTour">
                    <v-icon>mdi-navigation-variant</v-icon>无序游览
                </v-btn>
               <v-col cols="">
                <v-chip-group column active-class="indigo--text font-weight-black" v-model="strategy" mandatory>
                    <v-chip  value="distance" outlined><v-icon left>mdi-transit-connection-variant</v-icon>距离最短</v-chip>
                    <v-chip  value="time" outlined><v-icon left>mdi-timer-sand</v-icon>时间最短</v-chip>
                </v-chip-group>
            <v-radio-group v-model="transportation" row dense>
                <v-radio :value="0">
                    <template v-slot:label>
                        <v-icon color="indigo" class="mr-2">mdi-walk</v-icon>
                        仅步行
                    </template>
                </v-radio>
            <v-radio :value="1">
                <template v-slot:label>
                        <v-icon color="indigo">mdi-bike</v-icon>
                        <v-icon color="indigo">mdi-tram</v-icon>
                    可骑车/电车
                </template>
            </v-radio>
            </v-radio-group>
               </v-col>
            </v-row>
        </v-form>
    </v-card>
        <v-card id="container" flat></v-card>
        <v-card class="fixed-bottom my-card" elevation="10" tile color="indigo"  hover > <!-- 添加这一行 -->
            <v-textarea prepend-inner-icon="mdi-navigation-variant" placeholder="输出规划的路径：" label="输出路径：" v-model="pathOutput" auto-grow outlined dense rows="1" class="my-2 mx-5 white-background" rounded hide-details></v-textarea>
        </v-card> <!-- 添加这一行 -->
    </v-app>
</template>      

<script>
    import G6 from '@antv/g6';
    export default {
        data() {
                    return {
                        startSelectedNode: '',
                        to_id: '',
                        graph: null,
                        finalSelectedNode:'',
                        finalSelectedNode1: '',
                        strategy:0,
                        transportation:0,
                        points:[],
                        tooltip:null,
                        pathOutput:'',
                    };
                },
        computed: {
                    // 使用 computed 属性来获取 Vuex 中的数据
                    backendData() {
                        return this.$store.state.routeData.data;
                    },
                    mapId() {
                        return this.$store.state.routeData.mapId;
                    }
                },
       watch: {
                startSelectedNode(newVal) {
                    console.log(newVal);
                
                    // 更新选中节点的状态
                    // 检查 this.graph 是否已经被初始化
                    if (this.graph) {
                        // 遍历所有节点
                        this.graph.getNodes().forEach(node => {
                            // console.log(node.getModel().label);
                            // 如果节点的 label 等于 newVal，则将其 selected 状态设置为 true，否则设置为 false
                            if (node.getModel().label === newVal) {
                                this.graph.setItemState(node, 'start_selected', true); // 设置节点为选中状态
                            } else {
                                this.graph.setItemState(node, 'start_selected', false); // 移除选中状态
                            }
                        });
                    }
                },
        //         finalSelectedNode1(newVal) {
        //             console.log(newVal);
        //        // 检查 this.graph 是否已经被初始化
        //        if (this.graph) {
        //            // 遍历所有节点
        //            this.graph.getNodes().forEach(node => {
        //                 console.log(node.getModel().label);
        //                // 如果节点的 label 等于 newVal，则将其 selected 状态设置为 true，否则设置为 false
        //                if (node.getModel().label === newVal) {
        //                    this.graph.setItemState(node, 'final_selected', true); // 设置节点为选中状态
        //                } else {
        //                    this.graph.setItemState(node, 'final_selected', false); // 移除选中状态
        //                }
        //            });
        //        }
        //    },
            finalSelectedNode(newVal) {
               console.log(newVal);
               // 检查 this.graph 是否已经被初始化
               if (this.graph) {
                   // 将输入的字符串按空格分割成数组
                   const labels = newVal.split(' ');
                   // 遍历所有节点
                   this.graph.getNodes().forEach(node => {

                       // 如果节点的 label 在 labels 数组中，则将其 selected 状态设置为 true，否则设置为 false
                       if (labels.includes(node.getModel().label)) {
                           this.graph.setItemState(node, 'final_selected', true); // 设置节点为选中状态
                       } else {
                           this.graph.setItemState(node, 'final_selected', false); // 移除选中状态
                       }
                   });
               }
           }
            },
    //   created() {
    //             // 从路由参数中获取数据
    //             if (this.$route.query.data) {
    //                 try {
    //                     // 将字符串解析为 JSON 对象
    //                     this.backendData = JSON.parse(this.$route.query.data);
    //                     this.mapId = JSON.parse(this.$route.query.mapId);
    //                     console.log('返回数据1:', this.backendData);
    //                     console.log('返回mapId:',this.$route.query.mapId);
    //                 } catch (e) {
    //                     console.error('解析数据时发生错误:', e);
    //                 }
    //             }
    //         },
        mounted() {
            console.log('返回数据1:', this.$store.state.routeData.data);
            console.log('返回mapId:', this.$store.state.routeData.mapId);
            //     if (this.$route.query.data) {
            //     try {
            //         // 将字符串解析为 JSON 对象
            //         this.backendData = JSON.parse(this.$route.query.data);
            //         console.log('返回数据2:', this.backendData);
            //     } catch (e) {
            //         console.error('解析数据时发生错误:', e);
            //     }
            //    }
                const data = {
                    nodes: [],
                    edges: []
                };
                console.log('数据被定义')

            // 使用后端数据创建节点
               Object.keys(this.backendData.data.points).forEach(key => {
                   const point = this.backendData.data.points[key];
                   data.nodes.push({
                       id: point.pointId,
                       label: point.name,
                       type1: point.type,
                       x: point.x*3,
                       y: point.y*3,
                   });
                   console.log('节点1:',point.pointId);
               });

           // 使用后端数据创建边
               Object.keys(this.backendData.data.points).forEach(key => {
                const point = this.backendData.data.points[key];
                point.neighbors.forEach(neighbor => {
                    // 允许重复的边和自连接
                    data.edges.push({
                        source: point.pointId,
                        target: neighbor.destination,
                        label: `${neighbor.distance.toFixed()}m`
                    });
                    // console.log('边：', neighbor.destination);
                });
            });

            const graph = new G6.Graph({
                container: 'container',
                width:1200,
                height:600,
                defaultNode: {
                    shape: 'circle',
                    size: [60],
                    color: '#5B8FF9',
                    style: {
                        fill: '#9EC9FF',
                        lineWidth: 3
                    },
                    labelCfg: {
                        style: {
                            fill: '#000',
                            fontSize: 15
                        }
                    },
                },
                defaultEdge: {
                    style: {
                        stroke: '#F6BD16',
                        lineWidth: 2,
                        // endArrow: true
                    },
                    labelCfg: {
                        autoRotate: true
                    }
                },
                modes: {
                    default: ['zoom-canvas', 'drag-canvas']
                },
                grid: {
                    cell: 10,
                    show: true,
                    line: {
                        stroke: '#aaa',
                        lineWidth: 1,
                        lineAppendWidth: 3
                    }
                },
                nodeStateStyles: {
                    start_selected: {
                        fill: 'white', 
                        stroke: 'orange', 
                        lineWidth: 3, // 边框宽度
                        shadowColor: 'orange',
                        shadowBlur: 10, // 阴影模糊度
                        shadowOffsetX: 0, // 阴影在 X 轴的偏移量
                        shadowOffsetY: 0, // 阴影在 Y 轴的偏移量
                        shadowOpacity: 0.5, // 阴影透明度  
                    },
                    final_selected: {
                        fill: 'white', 
                        stroke: 'green', 
                        lineWidth: 3, // 边框宽度
                        shadowColor: 'green', 
                        shadowBlur: 10, // 阴影模糊度
                        shadowOffsetX: 0, // 阴影在 X 轴的偏移量
                        shadowOffsetY: 0, // 阴影在 Y 轴的偏移量
                        shadowOpacity: 0.5, // 阴影透明度  
                    },
                },
                edgeStateStyles: {
                    // 定义选中状态下的边的样式
                      selected1:
                      {
                        stroke: '#5B8FF9', // 边的默认颜色设置为黑色
                          lineWidth: 2, // 边的宽度
                          endArrow: {
                              path: G6.Arrow.vee(5, 10, 5), // 箭头样式
                          },
                          shadowBlur: 10, // 阴影的模糊级别
                          shadowColor: '#5B8FF9', // 阴影的颜色也设置为默认颜色
                          shadowOffsetX: 0, // 阴影在X轴方向的偏移量
                          shadowOffsetY: 0,  // 阴影在Y轴方向的偏移量
                          shadowOpacity: 0.5,
                      }
                }
            });
             this.tooltip = new G6.Tooltip({
                // 配置Tooltip的内容
                getContent: (e) => {
                    const model = e.item.getModel();
                    const type = model.type1; // 假设节点数据中包含type属性
                    const imgSrc = this.getImageByType(type); // 根据type获取图片路径
                    return `<img src="${imgSrc}" style="width:200px;height:200px;"/>`;
                },
                // 配置Tooltip的偏移量
                offsetX: -100,
                offsetY: -100,
                // 其他Tooltip配置...
                itemTypes: ['node'], // 确保tooltip只对节点生效
            });
            graph.data(data);
            graph.render();
            this.graph = graph; 
            this.graph.addPlugin(this.tooltip); // 将tooltip添加到图表实例
            this.graph.on('node:mouseenter', this.handleNodeMouseEnter);
            this.graph.on('node:mouseleave', this.handleNodeMouseLeave);
            
        },
        methods: {
             handleNodeMouseEnter(evt) {
                const node = evt.item;
                // 显示Tooltip
                this.graph.setItemState(node, 'show-tooltip', true);
            },
           handleNodeMouseLeave(evt) {
                const node = evt.item; // 从事件对象获取node
                // 隐藏Tooltip
                this.graph.setItemState(node, 'show-tooltip', false);
            },
            getImageByType(type) {
                const typeToImageMap = {
                    '教学楼': 'assets/teachingbuilding.jpg', // 景点类型1的图片路径
                    '宿舍楼': 'assets/dormitory.jpg', // 景点类型2的图片路径
                    '办公楼': 'assets/officebuilding.jpg', // 景点类型3的图片路径
                    '商店': 'assets/shop.jpg',
                    '餐馆': 'assets/restaurant.jpg',// 餐馆类型
                    '图书馆': 'assets/library.jpg', // 图书馆类型
                    '体育馆': 'assets/gym.jpg', // 体育馆类型
                    '景点':'assets/attraction.jpg',
                    '卫生间': 'assets/restroom.jpg',
                    '咖啡馆':'assets/coffee.jpg',
                    '超市':'assets/shop.jpg',
                    '停车场':'assets/parking.jpg',
                    '休息区':'assets/restarea.jpg',
                    '运动场':'assets/sportsfield.jpg',
                    '报告厅':'assets/lecturehall.jpg',
                    '绿化区':'assets/greenland.jpg',
                    '地标':'assets/landmark.jpg', 
                    '路口':'assets/crossing.jpg',
                    '食堂':'assets/canteen.jpg',
                    '奶茶店':'https://img1.baidu.com/it/u=3106223159,2776000347&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=543'
                };
                return typeToImageMap[type] || 'https://i.pinimg.com/474x/94/c1/12/94c1122db55e148274c66160377206fd.jpg'; // 如果没有匹配的类型，则返回默认图片
            },
                    getPoints()
                    {
                        // console.log('getPoints method called');
                        this.points=[];
                        // console.log('打印点：',this.points);
                        this.graph.getNodes().forEach(node => {
                    // 如果节点的 label 等于 newVal，则将其 selected 状态设置为 true，否则设置为 false
                      if (node.getModel().label === this.startSelectedNode) {
                        this.points.push(node.getModel().id)
                        console.log('Points:',this.points);
                    } 
                });
                 const labels =this.finalSelectedNode.split(' ');
                // 遍历所有节点
                   labels.forEach(label => {
                    // 遍历graph中的每个节点
                    this.graph.getNodes().forEach(node => {
                        // 检查节点的label是否与当前遍历到的label相等
                        if (node.getModel().label === label) {
                            // 如果相等，则将节点的id加入到points数组
                            this.points.push(node.getID());
                            console.log('Points:', this.points);
                        }
                    });
                });
            },
                    orderedTour() {
                    this.pathOutput='',
                    this.getPoints();
                    // 顺序游览的逻辑
                    const requestData = {
                    mapID: this.mapId,
                    points: this.points, // 按顺序列出您的路径点
                    strategy:this.strategy, 
                    transportation:this.transportation 
                };
                // 设置请求的URL
                const apiUrl = 'http://10.129.37.114:8321/routePlanningInOrder';
                // 使用axios发送POST请求
                this.$axios.post(apiUrl, requestData)
                    .then(response => {
                        // 请求成功时执行的代码
                        console.log('路径1规划成功:', response.data);
                            this.graph.getNodes().forEach(node => {
                                const model = node.getModel();
                                if(!this.points.includes(model.id))
                                {
                                    this.graph.setItemState(node, 'selected', false);
                                }
                             });
                             this.graph.getEdges().forEach(edge => {
                            this.graph.setItemState(edge, 'selected', false);
                            this.graph.setItemState(edge, 'selected1', false);
                            this.graph.updateItem(edge, {
                                    style: {
                                     endArrow: false,
                                     startArrow: false,
                                     stroke: '#F6BD16',
                                     lineWidth: 2,
                                    shadowBlur: 0, // 阴影的模糊级别
                                 }
                                 });
                        });
                        const dataLength = response.data.data.length;
                          response.data.data.forEach((edgeData,index) => {
                            console.log(edgeData.edgeId)
                            // 遍历graph中的每个节点
                            this.graph.getNodes().forEach(node => {
                                const model = node.getModel();
                                if ((model.id === edgeData.sourcePointId || model.id === edgeData.destinationPointId) && !this.points.includes(model.id)) {
                                    // 如果节点的id等于sourcePointId或destinationPointId，则设置节点状态为'selected'
                                    this.graph.setItemState(node, 'selected', true);
                                    console.log('显示点的变化');
                                }
                            });
                            // 遍历graph中的每条边
                            this.graph.getEdges().forEach(edge => {
                                const model = edge.getModel();
                                if ((model.source === edgeData.sourcePointId && model.target === edgeData.destinationPointId)|| (model.source === edgeData.destinationPointId && model.target === edgeData.sourcePointId)) {
                                  this.graph.updateItem(edge, {
                                        style: {
                                            stroke: edgeData.routeMethod === 1 ? 'blue' : '#5B8FF9', // 根据条件设置边的颜色
                                            lineWidth: edgeData.congestion * 10, // 边的宽度
                                            shadowBlur: 10, // 阴影的模糊级别
                                            shadowColor: edgeData.routeMethod === 1 ? 'blue' : '#5B8FF9', // 根据条件设置阴影的颜色
                                            shadowOffsetX: 0, // 阴影在X轴方向的偏移量
                                            shadowOffsetY: 0, // 阴影在Y轴方向的偏移量
                                            shadowOpacity: 0.5,
                                        }
                                        
                                    });
                                    console.log('routeMethod:',edgeData.routeMethod);
                                 
                            //    this.graph.setItemState(edge, 'selected', true);
                            //    const isSelected = edge.hasState('selected'); 
                            //         if (isSelected) {
                            //             console.log('边处于选中状态');
                            //         } else {
                            //             console.log('边未被选中');
                            //         }
                            //         console.log('显示边的变化');
                                }
                                 if(model.source === edgeData.sourcePointId && model.target === edgeData.destinationPointId)
                                 {
                                    this.graph.updateItem(edge, {
                                         style: {
                                             endArrow: {
                                                 path: G6.Arrow.vee(5, 10, 5),
                                                 d: 10,
                                                 fill: 'red', // 设置箭头填充色为黄色
                                                 stroke: 'red', // 设置箭头描边色为黄色
                                             }
                                         }
                                     });
                                    let sourcePointIdLabel = '';
                                     this.graph.getNodes().forEach(node => {
                                         const model = node.getModel();
                                         if (model.id === edgeData.sourcePointId) {
                                             sourcePointIdLabel = model.label; // 获取对应的 label 值
                                         }
                                     });
                                     console.log('打印：', sourcePointIdLabel);
                                     this.pathOutput+= `${sourcePointIdLabel}—>`
                                        if (index === dataLength - 1) {
                                            console.log('最后一次！');
                                         let destinationPointIdLabel = '';
                                            this.graph.getNodes().forEach(node => {
                                                const model = node.getModel();
                                                if (model.id === edgeData.destinationPointId) {
                                                    destinationPointIdLabel = model.label; // 获取对应的 label 值
                                                }
                                            });
                                        this.pathOutput += `${destinationPointIdLabel}`;
                                     }
                                 }
                            });
                            
                        });

                    })
                    .catch(error => {
                        // 请求失败时执行的代码
                        console.error('路径1规划失败:', error);
                    });
                    },
                    unorderedTour() {
                        this.pathOutput = '',
                        this.getPoints();
                        // 顺序游览的逻辑
                        const requestData = {
                            mapID: this.mapId,
                            points: this.points, // 按顺序列出您的路径点
                            strategy: this.strategy,
                            transportation: this.transportation
                        };
                        // 设置请求的URL
                        const apiUrl = 'http://10.129.37.114:8321/routePlanningNotInOrder';
                        // 使用axios发送POST请求
                        this.$axios.post(apiUrl, requestData)
                            .then(response => {
                                // 请求成功时执行的代码
                                console.log('路径2规划成功:', response.data);
                                this.graph.getNodes().forEach(node => {
                                    const model = node.getModel();
                                    if (!this.points.includes(model.id)) {
                                        this.graph.setItemState(node, 'selected', false);
                                    }
                                });
                                this.graph.getEdges().forEach(edge => {
                                    this.graph.setItemState(edge, 'selected', false);
                                    this.graph.setItemState(edge, 'selected1', false);
                                    this.graph.updateItem(edge, {
                                        style: {
                                            endArrow: false,
                                            startArrow: false,
                                            stroke: '#F6BD16',
                                            lineWidth: 2,
                                            shadowBlur: 0, // 阴影的模糊级别
                                        }
                                    });
                                });
                                const dataLength = response.data.data.length;
                                response.data.data.forEach((edgeData, index) => {
                                    console.log(edgeData.edgeId)
                                    // 遍历graph中的每个节点
                                    this.graph.getNodes().forEach(node => {
                                        const model = node.getModel();
                                        if ((model.id === edgeData.sourcePointId || model.id === edgeData.destinationPointId) && !this.points.includes(model.id)) {
                                            // 如果节点的id等于sourcePointId或destinationPointId，则设置节点状态为'selected'
                                            this.graph.setItemState(node, 'selected', true);
                                            console.log('显示点的变化');
                                        }
                                    });
                                    // 遍历graph中的每条边
                                    this.graph.getEdges().forEach(edge => {
                                        const model = edge.getModel();
                                        if ((model.source === edgeData.sourcePointId && model.target === edgeData.destinationPointId) || (model.source === edgeData.destinationPointId && model.target === edgeData.sourcePointId)) {
                                            this.graph.updateItem(edge, {
                                                style: {
                                                    stroke: edgeData.routeMethod === 1 ? 'blue' : '#5B8FF9', // 根据条件设置边的颜色
                                                    lineWidth: edgeData.congestion * 10, // 边的宽度
                                                    shadowBlur: 10, // 阴影的模糊级别
                                                    shadowColor: edgeData.routeMethod === 1 ? 'blue' : '#5B8FF9', // 根据条件设置阴影的颜色
                                                    shadowOffsetX: 0, // 阴影在X轴方向的偏移量
                                                    shadowOffsetY: 0, // 阴影在Y轴方向的偏移量
                                                    shadowOpacity: 0.5,
                                                }

                                            });
                                            console.log('routeMethod:', edgeData.routeMethod);

                                            //    this.graph.setItemState(edge, 'selected', true);
                                            //    const isSelected = edge.hasState('selected'); 
                                            //         if (isSelected) {
                                            //             console.log('边处于选中状态');
                                            //         } else {
                                            //             console.log('边未被选中');
                                            //         }
                                            //         console.log('显示边的变化');
                                        }
                                        if (model.source === edgeData.sourcePointId && model.target === edgeData.destinationPointId) {
                                            this.graph.updateItem(edge, {
                                                style: {
                                                    endArrow: {
                                                        path: G6.Arrow.vee(5, 10, 5),
                                                        d: 10,
                                                        fill: 'red', // 设置箭头填充色为黄色
                                                        stroke: 'red', // 设置箭头描边色为黄色
                                                    }
                                                }
                                            });
                                            let sourcePointIdLabel = '';
                                            this.graph.getNodes().forEach(node => {
                                                const model = node.getModel();
                                                if (model.id === edgeData.sourcePointId) {
                                                    sourcePointIdLabel = model.label; // 获取对应的 label 值
                                                }
                                            });
                                            console.log('打印：', sourcePointIdLabel);
                                            this.pathOutput += `${sourcePointIdLabel}—>`
                                            if (index === dataLength - 1) {
                                                console.log('最后一次！');
                                                let destinationPointIdLabel = '';
                                                this.graph.getNodes().forEach(node => {
                                                    const model = node.getModel();
                                                    if (model.id === edgeData.destinationPointId) {
                                                        destinationPointIdLabel = model.label; // 获取对应的 label 值
                                                    }
                                                });
                                                this.pathOutput += `${destinationPointIdLabel}`;
                                            }
                                        }
                                    });

                                });

                            })
                            .catch(error => {
                                // 请求失败时执行的代码
                                console.error('路径2规划失败:', error);
                            });
                    }
                }
                
        
    }


</script>

<style scoped>
    #container {
        width: 1200px;
        height: 600px;
        border: 2px solid #ccc;
        margin: 0 auto;
    }
    .v-application--wrap {
    padding: 0 !important;
}
 .fixed-bottom { 
        position: fixed;
        bottom: 0;
        width: 100%;
    }
    .my-card {
        border: 0.5px solid gray; 
    }
    .white-background {
    background-color: white !important;
}
::v-deep .v-textarea textarea {
    font-weight: bold; /* 加粗字体 */
    color:#5B8FF9; /* indigo颜色 */
}
</style>
