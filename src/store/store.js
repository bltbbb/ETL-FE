/**
 * Created by blt on 2017/8/14.
 */
import Vue from 'vue'
import lockr from 'lockr'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    domain:'http://192.168.1.21:8888', //请求接口
    //domain:'http://192.168.1.40:9090', //请求接口
    //保存用户信息
    userInfo: {}
  },
  mutations: {
    //更新用户信息
    updateUserInfo(state) {
      state.userInfo = lockr.get('userInfo');
    }
  }
})
