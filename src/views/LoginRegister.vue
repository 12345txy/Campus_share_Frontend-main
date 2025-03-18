<template>
    <v-app id="auth">
        <v-main class="bg align-center">
            <v-card class=" mx-auto my-auto d-flex flex-row flex-wrap" max-width="800px" elevation="8"
                style="background:none">
                <!-- Img -->
                <v-card class="d-flex flex-column justify-center rounded-0" width="440px" elevation="0"
                    style="background-color:#F5F5F5">
                    <span class="text-h5 black--text font-weight-black" style="position:absolute;top:30px;left:30px;">
                        <v-icon medium color="black" class="mr-2 mb-1" large>mdi-school
                        </v-icon>
                        BuptTravel
                    </span>
                    <v-btn rounded style="position:absolute;top:36px;right:15px;" class="px-0" text x-small depressed
                        onclick="window.open('https://github.com/112292454/DSlab.git')"> <v-icon medium color="black">
                            mdi-github
                        </v-icon>
                    </v-btn>

                    <v-img class="mx-auto mt-12" src="../assets/Travel.jpg" max-height="380px" max-width="400px">
                    </v-img>
                </v-card>

                <!-- Input -->
                <v-card class="pa-6 ml-auto rounded-0" width="360px" height="480px" elevation="0">
                    <v-card-title class="text-center justify-center py-6">
                        <h2 class="font-weight-bold text-h4 basil--text">
                            Welcome !
                        </h2>
                    </v-card-title>
                    <v-tabs background-color="transparent" color="black" centered>
                        <v-tab :key="0">Log in</v-tab>
                        <v-tab :key="1">Sign up</v-tab>
                        <v-tab-item :key="0">
                            <v-container class="px-12 pt-6">
                                <v-text-field label="Username" v-model="username1" append-icon="mdi-account-box-edit-outline" clearable>
                                </v-text-field >
                                <v-text-field 
                                class="mb-6" 
                                label="Password" 
                                :type="showPassword ? 'text' : 'password'" 
                                v-model="passwd1" 
                                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append="showPassword = !showPassword"
                                clearable>
                                </v-text-field>
                                <v-btn class="white--text font-weight-bold" :loading="loading" :disabled="loading" color="blue accent-2"
                                    outlined rounded @click="login();loader = 'loading'">
                                    Log in
                                </v-btn>
                            </v-container>
                        </v-tab-item>

                        <v-tab-item :key="1">
                            <v-container class="px-12 pt-2">
                                <v-text-field label="Username" v-model="username2" clearable>
                                </v-text-field>
                                <v-text-field label="Password" v-model="passwd2" clearable>
                                </v-text-field>
                                <v-text-field label="Email" v-model="email" append-icon="mdi-email-check-outline" :rules="[rules.email]" clearable>
                                </v-text-field>
                                <v-text-field label="Phonenumber" v-model="phonenumber" append-icon="mdi-phone" :rules="[rules.phone]" clearable>
                                </v-text-field>
                                <v-select label="Interest" :items="items"  placeholder="请选择你的兴趣" v-model="interestName" dense append-icon="mdi-heart" multiple></v-select>
                                <v-btn class="mt-6 white--text font-weight-bold" :loading="loading" :disabled="loading"
                                    color="blue accent-2" outlined rounded @click="signup();loader = 'loading'">
                                    Sign up
                                </v-btn>
                            </v-container>
                        </v-tab-item>
                    </v-tabs>
                </v-card>
            </v-card>

        </v-main>
    </v-app>
</template>

<script>
    export default {
      name: 'LoginRegster',
            data: () => ({
                username1: '',
                passwd1: '',
                username2: '',
                passwd2: '',
                email: '',
                phonenumber: '',
                loading: false,
                loader: null,
                showPassword: false,
                interestName:'',
                interests:[], 
                items: [{text:'历史遗迹',value:1},{text:'自然景观',value:2},{text:'公园',value:3},{text:'博物馆/科技馆',value:4},{text:'游乐园',value:5},{text:'动物园/植物园',value:6},{text:'学校',value:7}],
                rules: {
                    email: value => {
                        const pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
                        return pattern.test(value) || 'Invalid email format.';
                    },
                    phone: value => {
                        const pattern = /^1[3456789]\d{9}$/;
                        return pattern.test(value) || 'Invalid phone number format.';
                    }
                }
            }),
            watch: {
                loader() {
                    const l = this.loader
                    this[l] = !this[l]
                    setTimeout(() => (this[l] = false), 2000)
                    this.loader = null
                },
            },
            methods: {
                
                login: function () {
                    this.$axios({
                        method: 'post',
                        url: 'http://10.129.37.114:8321/login', // 修改为你的接口地址
                        data: {
                            userName: this.username1, // 修改为接口需要的参数名
                            userPassword: this.passwd1, // 修改为接口需要的参数名
                        },
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }).then(res => {
                        console.log(res.data);
                        if (res.data.code === '0') { // 根据接口文档，错误码为0表示正确
                            window.alert('登录成功');
                            this.$router.push('/TravelRecommend');
                        } else {
                            window.alert('账号或密码错误，请重试!如未注册，请先注册！')
                        }
                    }).catch(function (error) {
                        console.log(error);
                        this.loading = false;
                    })
                },
                 signup: function () {
                    // 验证邮箱
                    const emailPattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
                    if (!emailPattern.test(this.email)) {
                        window.alert('请输入有效的邮箱地址');
                        return;
                    }

                    // 验证电话号码
                    const phonePattern = /^1[3456789]\d{9}$/;
                    if (!phonePattern.test(this.phonenumber)) {
                        window.alert('请输入有效的电话号码');
                        return;
                    }

                    // 如果邮箱和电话号码都有效，发送请求
                    this.$axios({
                        method: 'post',
                        url: 'http://10.129.37.114:8321/register', // 修改为你的接口地址
                        data: {
                            userName: this.username2,
                            userPassword: this.passwd2,
                            email: this.email,
                            phoneNumber: this.phonenumber,
                             interests: this.interestName.map(id => {
    // 根据id找到对应的text
                                const item = this.items.find(item => item.value === id);
                                return { interestId: id, interestName: item ? item.text : '' };
                            })
                        },
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }).then(res => {
                        console.log(res.data);
                        if (res.data.code === '0') {
                            window.alert('注册成功,请登录');
                        } else {
                            window.alert('注册失败，请重试');
                        }
                    }).catch(function (error) {
                        console.log(error);
                    })
                },
            },
    };
</script>
<style>
    #auth {
        /* background-image:linear-gradient(#4285f4, #d2d5fc);*/
        background-image: url(../assets/bg3.jpg);
        background-size: cover;
        background-position: center center;
    }

    .bg {
        background-color: rgba(0, 0, 0, 0.1);
        /* backdrop-filter:blur(100px); */
    }

    .custom-loader {
        animation: loader 1s infinite;
        display: flex;
    }

    @-moz-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @-webkit-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @-o-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>