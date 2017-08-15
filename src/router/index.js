import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login/Login'
import Content from '@/components/Content/Content'
import Java from '@/components/Script/Java'
import Python from '@/components/Script/Python'
import Shell from '@/components/Script/Shell'
import TaskConfiguration from '@/components/TaskConfiguration/TaskConfiguration'
import TaskGroupConfiguration from '@/components/TaskGroupConfiguration/TaskGroupConfiguration'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/Content',
      name: 'Content',
      component: Content,
      children:[
        {
          path: '/Content/Java',
          name: 'Java',
          component: Java,
        },
        {
          path: '/Content/Python',
          name: 'Python',
          component: Python,
        },
        {
          path: '/Content/Shell',
          name: 'Shell',
          component: Shell,
        },
        {
          path: '/Content/TaskConfiguration',
          name: 'TaskConfiguration',
          component: TaskConfiguration,
        },
        {
          path: '/Content/TaskGroupConfiguration',
          name: 'TaskGroupConfiguration',
          component: TaskGroupConfiguration,
        }
      ]
    },
  ]
})
