<template>
    <v-app>
       <v-card class="mb-8" hover dense>
        <v-container d-flex class="pb-0 mt-3">
            <div style="position: relative; width: 100%;">
                <v-row>
                    <v-col cols="2">
                        <v-text-field outlined dense v-model="selection1" label="查询类型" append-icon="mdi-magnify" @input="searchType"></v-text-field>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="10">
                            <v-chip-group dense v-model="selection" active-class="indigo--text text--accent-4 font-weight-black" mandatory
                                center-active show-arrows>
                                <v-chip v-for="filter in filters" :key="filter" :value="filter">
                                    {{ filter }}
                                </v-chip>
                            </v-chip-group>
                    </v-col>
                </v-row>
            </div>
        </v-container>
    </v-card>
    <v-row>
        <v-col cols="2" class="ml-2">
            <v-card>
                <v-app-bar dense dark color="indigo" border="bottom" elevation="2">
                    <v-app-bar-nav-icon @click="menu = !menu"></v-app-bar-nav-icon>
                    <v-app-bar-title>查询结果排序</v-app-bar-title></v-app-bar>
                    <v-expand-transition>
                        <v-list v-show="menu" >
                            <v-list-item style="width: 100%;" v-for="node in selectedNodes" :key="node.id" dense>
                                <v-list-item-title class="font-weight-bold text--secondary mr-4">
                                        <v-icon color="red" class="mr-2" small>mdi-map-marker</v-icon>{{node.getModel().label}}
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-bold text--secondary"><v-icon class="mr-2" color="brown">mdi-foot-print</v-icon>{{ node.getModel().dist }}m</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-expand-transition>

            </v-card>
        </v-col>
        <!-- 右侧的v-card，占10列 -->
        <v-col cols="9">
            <!-- v-card的内容 --> 
            <v-card id="container" flat></v-card>
        </v-col>
    </v-row>
    </v-app>
</template>

<script>
    import G6 from '@antv/g6';
    export default {
        data() {
            return {
                selection: '不限',
                filters: [
                    '不限','景点', '教学楼', '办公楼', '宿舍楼', '商店', '餐馆','卫生间','图书馆','食堂','超市','咖啡馆','停车场','休息区','体育馆','运动场','报告厅','绿化区','地标','路口','不限'
                ],
                startSelectedNode: '',
                to_id: '',
                graph: null,
                finalSelectedNode: '',
                finalSelectedNode1: '',
                strategy: 0,
                transportation: 0,
                points: [],
                tooltip: null,
                pathOutput: '',
                backendArray:'',
                selectedNode: null,
                menu:true,
                selectedNodes:[],
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
            selection() {
                            if (this.selectedNode) {
                                this.updateNodeStates(this.selectedNode);
                            }
                        },
                    },
        // created() {
        //     // 从路由参数中获取数据
        //     if (this.$route.query.data) {
        //         try {
        //             // 将字符串解析为 JSON 对象
        //             this.backendData = JSON.parse(this.$route.query.data);
        //             this.mapId = JSON.parse(this.$route.query.mapId);
        //             console.log('返回数据1:', this.backendData);
        //             console.log('返回mapId:', this.$route.query.mapId);
        //         } catch (e) {
        //             console.error('解析数据时发生错误:', e);
        //         }
        //     }
        // },
        mounted() {
            console.log('menu:',this.menu);
            console.log('selection:', this.selection);
            console.log('mapId:', this.mapId);
            console.log("返回数据2:", this.backendData);
            console.log("返回mapId:", this.mapId);
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
                    x: point.x * 3,
                    y: point.y * 3,

                });
                   console.log('节点2:',point.pointId);
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
                width: 1065,
                height: 600,
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
        //    graph.on('node:click', (evt) => {
        //       graph.getNodes().forEach((node) => {
        //            graph.clearItemStates(node);
        //        });
        //         const node = evt.item;
        //         // 设置当前节点为'selected'
        //         graph.setItemState(node, 'selected', true);
               
        //         // 获取当前节点的邻居节点
        //         this.$axios.post('http://10.129.37.114:8321/AreaServicesearch', {
        //            mapID: this.mapId,
        //            type: this.selection === '不限' ? '' : this.selection, 
        //            sourcePointId: node.getModel().id,
        //        })
        //            .then(function (response) {
        //                console.log('数据传输成功:', response);
                    
        //                 let backendArray = response.data.data;
        //                // 现在可以对 backendArray 进行操作
        //                backendArray.forEach((item) => {
        //                      graph.getNodes().forEach(node => {
        //                          if (node.getModel().id === item.pointId&& node.getModel().id !==  evt.item.getModel().id) {
        //                          graph.setItemState(node, 'final_selected', true);
        //                          }
        //                     });
        //                });

        //            })
        //            .catch(function (error) {
        //                console.error('数据传输错误:', error);
        //            });
        //     });
        // graph.on('node:click', (evt) => {
        //         // 清空所有节点的状态
        //         graph.getNodes().forEach((node) => {
        //             graph.clearItemStates(node);
        //         });

        //         const node = evt.item;
        //         // 设置当前节点为'selected'
        //         // 获取当前节点的邻居节点
        //         const neighbors = graph.getNeighbors(node);
        //         neighbors.forEach((neighbor) => {
        //             // 设置邻居节点为'final_selected'
        //             if (this.selection === '不限') {
        //                 graph.setItemState(neighbor,'final_selected', true);
        //             }
        //             else {
        //                 if (neighbor.getModel().type1 === this.selection) 
        //                 { graph.setItemState(neighbor, 'final_selected', true); }
        //                 else { graph.setItemState(neighbor, 'final_selected', false); }
        //             }
        //             // 获取邻居节点的邻居节点
        //             const neighborsOfNeighbor = graph.getNeighbors(neighbor);
        //             neighborsOfNeighbor.forEach((neighborOfNeighbor) => {
        //                 // 如果邻居的邻居节点不是鼠标点击的节点，则设置为'final_selected'
        //                     if(this.selection==='不限')
        //                     { 
        //                         graph.setItemState(neighborOfNeighbor, 'final_selected', true); 
        //                     }
        //                     else 
        //                     { 
        //                         if (neighborOfNeighbor.getModel().type1 === this.selection)
        //                         { graph.setItemState(neighborOfNeighbor, 'final_selected', true); }
        //                         else
        //                         { graph.setItemState(neighborOfNeighbor, 'final_selected', false);}
        //                     }
                        
        //             });
        //         });
        //         graph.setItemState(node, 'selected', true);
        //     });

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
            this.graph.on('node:click', this.handleNodeClick);
        },
        methods: {
            searchType() {
                this.selection = this.selection1;
            },
           updateNodeStates(node) {
                // 清空所有节点的状态并初始化dist为无穷大
                this.graph.getNodes().forEach((n) => {
                    this.graph.clearItemStates(n);
                    n.getModel().dist = Infinity;
                    this.selectedNodes=[];
                });

                // 设置当前节点的dist为0并标记为'selected'
                node.getModel().dist = 0;
                // 获取当前节点的邻居节点
                const edges = this.graph.getEdges();
                const neighbors = this.graph.getNeighbors(node);
                neighbors.forEach((neighbor) => {
                    // 找到连接当前节点和邻居节点的边
                    const edgeToNeighbor = edges.find(e => e.getSource() === node && e.getTarget() === neighbor);
                    if (edgeToNeighbor) {
                        // 设置邻居节点的dist为边的label
                        neighbor.getModel().dist = parseFloat(edgeToNeighbor.getModel().label) || 1; // 如果没有label，默认为1
                    }

                    // 根据selection设置邻居节点状态
                    const isSelected = this.selection === '不限' || neighbor.getModel().type1 === this.selection;
                    this.graph.setItemState(neighbor, 'final_selected', isSelected);
                    if (isSelected) {
                        // 检查selectedNodes数组中是否已经存在该节点
                        const isNodeAlreadySelected = this.selectedNodes.some(selectedNode =>
                            selectedNode === neighbor
                        );

                        // 如果节点不存在于数组中，则添加它
                        if (!isNodeAlreadySelected) {
                            this.selectedNodes.push(neighbor);
                            console.log("push_neighbor:", neighbor.getModel().label);
                        }
                    }
                    // 获取邻居节点的邻居节点
                    const neighborsOfNeighbor = this.graph.getNeighbors(neighbor).filter(n => n !== node);
                    neighborsOfNeighbor.forEach((neighborOfNeighbor) => {
                        // 找到连接邻居节点和邻居的邻居节点的边
                        const edgeToNeighborOfNeighbor = edges.find(e => e.getSource() === neighbor && e.getTarget() === neighborOfNeighbor);
                        if (edgeToNeighborOfNeighbor) {
                            // 计算总距离
                            const totalDistance = neighbor.getModel().dist + parseFloat(edgeToNeighborOfNeighbor.getModel().label) || 1;
                            // 如果计算出的总距离小于当前存储的距离，则更新dist
                            if (totalDistance < neighborOfNeighbor.getModel().dist) {
                                neighborOfNeighbor.getModel().dist = totalDistance;
                            }
                        }

                        // 根据selection设置邻居的邻居节点状态
                        const isSelectedNeighbor = this.selection === '不限' || neighborOfNeighbor.getModel().type1 === this.selection;
                        this.graph.setItemState(neighborOfNeighbor, 'final_selected', isSelectedNeighbor);
                       if (isSelectedNeighbor) {
                            // 检查selectedNodes数组中是否已经存在该节点
                            const isNodeAlreadySelected = this.selectedNodes.some(selectedNode =>
                                selectedNode === neighborOfNeighbor
                            );

                            // 如果节点不存在于数组中，则添加它
                            if (!isNodeAlreadySelected) {
                                this.selectedNodes.push(neighborOfNeighbor);
                                console.log("push_neighbor_of_neighbor:", neighborOfNeighbor.getModel().label);
                            }
                        }
                    });
                });
                this.selectedNodes = this.selectedNodes.filter(n => n !== node);
                this.selectedNodes.sort((a, b) => a.getModel().dist - b.getModel().dist);
                   this.graph.setItemState(node, 'selected', true);
                console.log('selectedNodes:',this.selectedNodes);
            },

            handleNodeClick(evt) {
                const node = evt.item;
                this.selectedNode = node; // 存储被选中的节点
                this.updateNodeStates(node);
            },
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
                    '景点': 'assets/attraction.jpg',
                    '卫生间': 'assets/restroom.jpg',
                    '咖啡馆': 'assets/coffee.jpg',
                    '超市': 'assets/shop.jpg',
                    '停车场': 'assets/parking.jpg',
                    '休息区': 'assets/restarea.jpg',
                    '运动场': 'assets/sportsfield.jpg',
                    '报告厅': 'assets/lecturehall.jpg',
                    '绿化区': 'assets/greenland.jpg',
                    '地标': 'assets/landmark.jpg',
                    '路口': 'assets/crossing.jpg',
                    '食堂': 'assets/canteen.jpg',
                    '奶茶店':'https://img1.baidu.com/it/u=3106223159,2776000347&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=543'
                };
                return typeToImageMap[type] || 'https://i.pinimg.com/474x/94/c1/12/94c1122db55e148274c66160377206fd.jpg'; // 如果没有匹配的类型，则返回默认图片
            },
            // getPoints() {
            //     // console.log('getPoints method called');
            //     this.points = [];
            //     // console.log('打印点：',this.points);
            //     this.graph.getNodes().forEach(node => {
            //         // 如果节点的 label 等于 newVal，则将其 selected 状态设置为 true，否则设置为 false
            //         if (node.getModel().label === this.startSelectedNode) {
            //             this.points.push(node.getModel().id)
            //             console.log('Points:', this.points);
            //         }
            //     });
            //     const labels = this.finalSelectedNode.split(' ');
            //     // 遍历所有节点
            //     labels.forEach(label => {
            //         // 遍历graph中的每个节点
            //         this.graph.getNodes().forEach(node => {
            //             // 检查节点的label是否与当前遍历到的label相等
            //             if (node.getModel().label === label) {
            //                 // 如果相等，则将节点的id加入到points数组
            //                 this.points.push(node.getID());
            //                 console.log('Points:', this.points);
            //             }
            //         });
            //     });
            // }
        }
};
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
        font-weight: bold;
        /* 加粗字体 */
        color: #5B8FF9;
        /* indigo颜色 */
    }
</style>