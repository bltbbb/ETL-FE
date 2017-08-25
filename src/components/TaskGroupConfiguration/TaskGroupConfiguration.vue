<template>
  <div class="TaskConfiguration">
    <div class="header">
      <h1>任务组配置</h1>
    </div>
    <div class="wrapper-father">
      <div class="btn-wrapper">
        你选择的任务组是：<Tag style="margin-right: 30px;" color="blue" closable @on-close="closeTag" type="border">{{choosePoint}}</Tag>
        <Button type="primary" :disabled="btnStatus||rootBtn" @click="change()">编辑</Button>
        <Button type="primary" :disabled="btnStatus" @click="add()">新增</Button>
        <Button type="primary" :disabled="btnStatus||rootBtn" @click="deleteTask">删除</Button>
      </div>
      <div class="chart-wrapper">
        <div id="myChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import qs from 'qs'

  export default {
    data () {
      return {
        pkId: 0,
        choosePoint: '未选择',
        myChart: null,
        btnStatus: true,
        rootBtn: true,
        links: [],
        chartData: [],
        options: {
          title:{
            text: "任务组配置",
            top: "30",
            left: "center"
          },
          tooltip: {
            formatter:function (params) {
                if(params.data.groupName){
                  return `<div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>任务组名称：${params.data.groupName}<div>
                          <div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>运行状态：${params.data.message}<div>`
                }
            },
            padding: 5
          },
          toolbox: {
            show : true,
            feature : {
              dataView : {show: true, readOnly: true},
              restore : {show: true},
              saveAsImage : {show: true}
            }
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
          animationEasingUpdate: 'quinticInOut',
          hoverAnimation:true,
          series: [
              {
            type: 'graph',
            layout: 'circular',
            force: {
              repulsion: 500,
              edgeLength:[10, 50]
            },
            data: [],
            links: [],
            edgeSymbol: ['circle', 'arrow'],
            symbolSize: 20,
            edgeSymbolSize: [4, 7],
            focusNodeAdjacency: true,
            roam: true,
            label: {
              normal: {
                show: true,
                position: 'top',

              }
            },
            lineStyle: {
              normal: {
                color: 'source',
                curveness: 0.1,
                type: "solid"
              }
            }
          }]
        }
      }
    },
    mounted(){
      this.drawLine();
      this.init();
    },
    methods: {
      init(){
        this.$http.get(this.$store.state.domain+'/group/selectRely').then(res=>{
          let data = res.data.result.result;
          for (let i in data){
            if(data[i].isSuccess == 1){
                data[i].itemStyle = {};
                data[i].itemStyle.normal = {};
                data[i].itemStyle.normal.color = '#17a05e'
            }
            data[i].name = data[i].groupName
          }
          data.unshift({
            name:"root",
            pkId:"-1",
            groupName: "root",
            itemStyle:{
              normal:{
                color: '#17a05e'
              }
            }
          });
          this.chartData = data;
          this.$http.get(this.$store.state.domain+'/confRelyGroup').then(res=>{
            let data = res.data.result.result;
            for (let i in data){
              if(data[i].relygroupName == null){data[i].relygroupName = 'root'}
              this.links.push({
                "source": data[i].relygroupName,
                "target": data[i].groupName
              })
            }
            this.myChart.setOption({
              series: [{
                // 根据名字对应到相应的系列
                data: this.chartData,
                links: this.links
              }]
            })
          });
        });
      },
      treeClick(evt){
          this.btnStatus = false;
      },
      closeTag(){
        this.btnStatus = true;
        this.rootBtn = false;
        this.choosePoint = '未选择'
      },
      change(){
        this.$router.push({ name: 'TaskGroupConfigurationDetail', params: { groupId: this.pkId,add: false }})
      },
      add(){
        this.$router.push({ name: 'TaskGroupConfigurationDetail', params: { groupId: this.pkId,add: true }})
      },
      deleteTask(){
        this.$http.delete(this.$store.state.domain+'/confRelyGroup',{
            params:{
                id:this.pkId
            }
        }).then(res=>{
          if(res.data.status == 0){
              this.$Message.success('删除成功');
              this.closeTag();
              this.init();
          }else {
              this.$Message.error('删除失败');
          }
        });
      },
      drawLine(){
        // 基于准备好的dom，初始化echarts实例
        this.myChart = echarts.init(document.getElementById('myChart'));
        this.myChart.setOption(this.options);
        //添加点击事件
        this.myChart.on('click', params=> {
          // 弹窗打印数据的名称
          if(params.data.groupName == 'root'){
            this.rootBtn = true;
          }else{
            this.rootBtn = false;
          }
          this.btnStatus = false;
          this.choosePoint = params.data.groupName;
          this.pkId = params.data.pkId;
          console.log(this.pkId)
        });
        window.onresize = this.myChart.resize;
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
    .wrapper-father
      overflow: hidden
      .btn-wrapper
        margin: 15px 0 0 10px
      .tree-wrapper
        float: left
        width: 100%
        height: 600px
        margin: 10px 0 30px 10px
        h3
          font-size: 18px
          padding-bottom: 15px
      .add-wrapper
        float: left
        padding: 30px 0 50px 130px
        border-left: 1px solid #ccc
        margin-bottom: 30px
        h3
          font-size: 18px
          padding-bottom: 15px
    .treeclass
      width: 100%
      height: 650px
    #myChart
      width: 100%
      height: 800px
</style>
