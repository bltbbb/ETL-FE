// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iview from 'iview';
import 'iview/dist/styles/iview.css';    // 使用 CSS
import './assets/js/DateFormat';  //datePicker
import axios from 'axios'
import Vuex from 'vuex'
import store from './store/store'
import VueCookie from 'vue-cookie'
import Highlight from './components/highlight/highlight.js'
import lockr from 'lockr'

Vue.config.productionTip = false;
Vue.use(Highlight)
Vue.use(iview);
Vue.use(Vuex);
Vue.use(VueCookie);
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

//路由res拦截
// axios.interceptors.response.use(
//   res => {
//     if(res.data.status == 2){
//       vueApp.$router.push('/login');
//     }
//     return res
//   });

Vue.prototype.$http = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  watch: {
    "$route": 'checkLogin'
  },
//进入页面时 验证是否登录
  created() {
    this.checkLogin();
  },
  methods: {
    checkLogin(){
      //检查是否存在Token
      if (!lockr.get('userInfo')) {
        //如果没有登录状态则跳转到登录页 并移除localstorege
        lockr.rm("userInfo");
        this.$router.push('/login');
      }
      this.$http.interceptors.response.use(
        res => {
          if(res.data.status == 2){
            this.$router.push('/login');
          }
          return res
        });
    }
  },
  template: '<App/>',
  components: {App}
})
