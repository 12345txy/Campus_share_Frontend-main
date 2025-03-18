const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    port: 8321
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/Data_Structure_Project/' 
    : '/'
})