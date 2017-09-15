import Vue from 'vue'
import Router from 'vue-router'
import Store from '../store/store'
//路由懒加载
const Login = () => import('@/components/Login/Login')
const Content = () => import('@/components/Content/Content')
const Java = () => import('@/components/Script/Java')
const Python = () => import('@/components/Script/Python')
const Shell = () => import('@/components/Script/Shell')
const TaskConfiguration = () => import('@/components/TaskConfiguration/TaskConfiguration')
const TaskGroupConfiguration = () => import('@/components/TaskGroupConfiguration/TaskGroupConfiguration')
const TaskGroupConfigurationDetail = () => import('@/components/TaskGroupConfiguration/TaskGroupConfigurationDetail')

Vue.use(Router)

const router =  new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/Content/Java'
    },
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/Login',
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
        },
        {
          path: '/Content/TaskGroupConfigurationDetail',
          name: 'TaskGroupConfigurationDetail',
          component: TaskGroupConfigurationDetail,
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  var nameTemp = to.name;
  if(to.name == 'TaskGroupConfigurationDetail'){
    nameTemp = 'TaskGroupConfiguration'
  }
  Store.state.menuName = nameTemp;
  next();
})

export default router;
