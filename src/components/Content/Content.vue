<template>
  <div class="layout">
    <Row type="flex">
      <i-col span="3" class="layout-menu-left">
        <Menu active-name="1-1" theme="dark" width="auto" :open-names="['1']">
          <Submenu name="1">
            <template slot="title">
              <Icon type="document-text"></Icon>
              脚本配置
            </template>
            <Menu-item name="1-1"><router-link to="/Content/Java">JAVA脚本</router-link></Menu-item>
            <Menu-item name="1-2"><router-link to="/Content/Python">Python脚本</router-link></Menu-item>
            <Menu-item name="1-3"><router-link to="/Content/Shell">Shell脚本</router-link></Menu-item>
          </Submenu>
          <Menu-item name="2" class="singleItem">
            <router-link to="/Content/TaskConfiguration"><Icon type="document"></Icon>
            <span style="padding-left: 9px;" class="layout-text">任务配置</span></router-link>
          </Menu-item>
          <Menu-item name="3" class="singleItem">
            <router-link to="/Content/TaskGroupConfiguration"><Icon type="clipboard"></Icon>
            <span style="padding-left: 9px;" class="layout-text">任务组配置</span></router-link>
          </Menu-item>
        </Menu>
      </i-col>
      <i-col span="21">
        <div class="layout-ceiling">
          <div class="layout-ceiling-main">
            <span><Icon type="log-out"></Icon></span><a style="padding-left: 5px;" href="#">退出</a>
          </div>
        </div>
        <div class="layout-content">
          <div class="layout-content-main">
            <router-view></router-view>
          </div>
        </div>
        <div class="layout-copy">
          2015-2017 &copy; shixinhulian
        </div>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default{

  }
</script>
<style scoped lang="sass">
  .layout
    overflow: hidden
    background: #f5f7f9
    position: relative

  .layout-breadcrumb
    text-align: left
    padding: 10px 15px 0

  .layout-content
    text-align: left
    min-height: 200px
    margin: 15px
    overflow: hidden
    background: #fff
    border-radius: 4px

  .layout-ceiling
    background: #fff
    padding: 10px 0
    overflow: hidden

  .layout-ceiling-main
    float: right
    margin-right: 15px

  .layout-ceiling-main a
    color: #9ba7b5

  .layout-ceiling-main span
    color: #9ba7b5

  .layout-copy
    text-align: center
    padding: 10px 0 20px
    color: #9ea7b4

  .layout-menu-left
    padding-top: 10px
    min-height: 100vh
    background: #464c5b
    a
      display: inline-block
      padding: 12px 22px
      width: 100%
      color: #fff

  .layout-header
    height: 60px
    background: #fff
    box-shadow: 0 1px 1px rgba(0,0,0,.1)

  .layout-logo-left
    width: 90%
    height: 5px
    border-radius: 3px
    margin: 15px auto

</style>
