<template>
  <div class="TaskConfiguration">
    <div class="header">
      <h1>任务配置</h1>
    </div>
    <div class="tree-wrapper">
      <h3>现有配置</h3>
      <Tree :data="baseData"></Tree>
    </div>
    <div class="add-wrapper">
      <h3>新增配置</h3>
      <Transfer
        :data="data2"
        filterable
        :target-keys="targetKeys2"
        :filter-method="filterMethod"
        :list-style="listStyle"
        @on-change="handleChange2"></Transfer>
    </div>
  </div>
</template>

<script>
  import qs from 'qs'
  export default {
    data () {
      return {
        formItem:{
          input1: '',
          input2: '',
          input3: ''
        },
        baseData: [{
          expand: true,
          title: '配置一',
          children: [{
            title: '脚本1',
            expand: true
          }, {
            title: '脚本2',
            expand: true
          }]
        },
        {
          expand: true,
          title: '配置二',
          children: [{
            title: '脚本1',
            expand: true
          }, {
            title: '脚本2',
            expand: true
          }]
        }
        ],
        data2: this.getMockData(),
        targetKeys2: '',
        listStyle:{
          width: '250px',
          height: '300px'
        }
      }
    },
    mounted(){
      this.init()
    },
    methods: {
      init(){
        let data = {
          current: 1,
          size: 20,
          scriptName: '交互追踪'
        }
//        this.$http.post('http://192.168.1.21:8888/javaScript/page',qs.stringify(data)).then(res=>{
//            this.data = res.data.result.result
//        })
      },
      show (index) {
        this.$Modal.info({
          title: '用户信息',
          content: `姓名：${this.data6[index].name}<br>年龄：${this.data6[index].age}<br>地址：${this.data6[index].address}`
        })
      },
      remove (index) {
        this.data6.splice(index, 1);
      },
      getMockData () {
        let mockData = [];
        for (let i = 1; i <= 20; i++) {
          mockData.push({
            key: i.toString(),
            label: '脚本' + i,
            description: '脚本' + i + '的描述信息'
          });
        }
        return mockData;
      },
      //显示在右侧的数据
      getTargetKeys () {
        return this.getMockData()
          .filter(() => Math.random() * 2 > 1)
          .map(item => item.key);
      },
      handleChange2 (newTargetKeys) {
        this.targetKeys2 = newTargetKeys;
      },
      filterMethod (data, query) {
        return data.label.indexOf(query) > -1;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .TaskConfiguration
    padding: 0 20px
    .header
      padding-top: 30px
      font-size: 20px
      border-bottom: 1px solid #ccc
      padding-bottom: 5px
    .form-wrapper
      margin-top: 30px
      padding: 15px 0
    .tree-wrapper
      float: left
      width: 200px
      margin: 30px 0 30px 80px
      h3
        font-size: 18px
        padding-bottom: 15px
    .add-wrapper
      float: left
      padding: 30px 0 30px 50px
      border-left: 1px solid #ccc
      h3
        font-size: 18px
        padding-bottom: 15px
</style>
