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
import Highlight from './components/highlight/highlight.js'


Vue.config.productionTip = false;
Vue.use(Highlight)
Vue.use(iview);
Vue.use(Vuex);
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

Vue.prototype.$http = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
