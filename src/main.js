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

Vue.config.productionTip = false;
Vue.use(iview);
Vue.use(Vuex);
axios.defaults.withCredentials = true;

Vue.prototype.$http = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
