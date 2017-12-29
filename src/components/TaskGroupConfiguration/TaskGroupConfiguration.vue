<template>
  <div class="TaskConfiguration">
    <div class="header">
      <h1 style="display: inline;">任务组配置</h1>
      <div class="selectWrapper">
        <span>请选择任务分类：</span>
        <div class="classSelect">
          <Select @on-change="classChange" v-model="classModel" filterable>
            <Option v-for="(item,index) in classData" :value="item.pkId" :key="index">{{ item.classifyName }}</Option>
          </Select>
        </div>
      </div>
    </div>
    <div class="wrapper-father">

      <div class="btn-wrapper">
        <div class="tag-block">
          你选择的任务组是：
          <Tag style="margin-right: 30px;" v-for="item in choosePoint" :name="item.name" color="blue" closable
               @on-close="closeTag" :key="item.id" type="border">{{item.name}}
          </Tag>
        </div>
        <div class="btn-block">
          <div class="btn-container" style="float: right;">
            <Button type="primary" :disabled="btnStatus||rootBtn" @click="change()">编辑</Button>
            <Button type="primary" :disabled="btnStatus||groupBtn3" @click="add()">新增</Button>
            <Button type="primary" :disabled="btnStatus||rootBtn" @click="deleteTask">删除</Button>
            <Button type="primary" :disabled="btnStatus||rootBtn||canRun||groupBtn3" @click="reRun">执行</Button>
            <Button type="primary" :disabled="groupBtn" @click="startTask(false)">停用</Button>
            <Button type="primary" :disabled="groupBtn2" @click="startTask(true)">启用</Button>
          </div>
          <br>
          <Row>
            <Col span="10" style="padding-right:10px;width: 100%;">
              <div class="select-wrapper">
                <Select @on-change="selectChange" @on-query-change="queryChange" v-model="model11" filterable>
                  <Option v-for="(item,index) in chartData" :value="index" :key="index">{{ item.name }}</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </div>
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
        token:'',
        classModel:'',
        classData: [],
        groupBtn: true,
        groupBtn2: true,
        groupBtn3: true,
        canRun: true,
        oldSelect: '',
        model11: '',
        agin: false,
        pkId: 0,
        choosePoint: [{name: '未选择'}],
        myChart: null,
        btnStatus: true,
        rootBtn: true,
        links: [],
        chartData: [],
        options: {
          title: {
            top: "30",
            left: "center"
          },
          tooltip: {
            formatter: function (params) {
              if (params.data.groupName) {
                return `<div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>任务组名称：${params.data.groupName}<div>
                          <div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>运行状态：${params.data.message}<div>
                          <div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>CRON：${params.data.cron}<div>`
              }
            },
            padding: 5
          },
          toolbox: {
            show: true,
            feature: {
              dataView: {show: true, readOnly: true},
              restore: {show: true},
              saveAsImage: {show: true}
            }
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
          animationEasingUpdate: 'quinticInOut',
          hoverAnimation: true,
          series: [
            {
              type: 'graph',
              layout: 'circular',
              force: {
                repulsion: 500,
                edgeLength: [10, 50]
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
                  position: 'top'
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
      this.initParams()
      this.drawLine();
      this.init();
    },
    methods: {
      initParams () {
        this.token = this.$cookie.get('adoptToken');
      },
      init(){
        this.classDataGet();
      },
      selectRelyGet(){
        this.$http.get(this.$store.state.domain + '/group/selectRely',{
          params:{
            adoptToken : this.token,
            classifyId: this.classModel
          }
        }).then(res => {
          let data = res.data.result.result;
          for (let i in data) {
            data[i].itemStyle = {};
            data[i].itemStyle.normal = {};
            if (data[i].isSuccess == 1) {
              data[i].itemStyle.normal.color = '#17a05e'
              data[i].message = '成功'
            }else {
              data[i].message = '失败'
            }
            if (data[i].groupStatus == 0) {
              data[i].itemStyle.normal.color = '#000'
              data[i].message = '停用'
            }
            data[i].name = data[i].groupName
          }
          data.unshift({
            name: "root",
            pkId: "-1",
            groupName: "root",
            itemStyle: {
              normal: {
                color: '#17a05e'
              }
            }
          });
          this.chartData = data;
          this.relyGroupGet();
        });
      },
      relyGroupGet(){
        this.$http.get(this.$store.state.domain + '/confRelyGroup',{
          params:{
            adoptToken : this.token,
            classifyId: this.classModel
          }
        }).then(res => {
          let data = res.data.result.result;
          for (let i in data) {
            if (data[i].relygroupName == null) {
              data[i].relygroupName = 'root'
            }
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
      },
      classDataGet(){
        this.$http.get(this.$store.state.domain + '/classify/selectList',{
            params:{
              adoptToken : this.token,
            }
        }).then(res => {
          let data = res.data.result.result;
          this.classData = data;
          this.classModel = data[0].pkId;
          this.selectRelyGet();
        });
      },
      classChange(val){
        this.choosePoint= [{name: '未选择'}];
        this.selectRelyGet();
      },
      treeClick(evt){
        this.btnStatus = false;
      },
      closeTag(ev, name){
        let index = 0;
        this.choosePoint.forEach((val, i) => {
          if (val.name == name) {
            index = i;
          }
        });
        this.choosePoint.splice(index, 1);
        for (let i in this.chartData) {
          if (this.chartData[i].groupName == name) {
            this.chartData[i].symbolSize = 20;
            if (this.chartData[i].isSuccess == 1) {
              this.chartData[i].itemStyle.normal.color = '#17a05e'
            } else {
              this.chartData[i].itemStyle.normal.color = '#c23531'
            }
            if (this.chartData[i].groupStatus == 0) {
              this.chartData[i].itemStyle.normal.color = '#000'
            }
          }
        }
        this.myChart.setOption({
          series: [{
            // 根据名字对应到相应的系列
            data: this.chartData
          }]
        });
        if(name = 'root'){
          this.rootBtn = false;
        }
        if (this.choosePoint.length < 1) {
          this.choosePoint.push({name: '未选择'})
        }
        if (this.choosePoint[0].name == '未选择') {
          this.btnStatus = true;
          this.rootBtn = false;
          this.groupBtn = true;
          this.groupBtn2 = true;
          this.groupBtn3 = true;
        }
        if (this.choosePoint.length == 1 && this.choosePoint[0].name == 'root') {
          this.rootBtn = true;
        }
      },
      change(){
        if (this.choosePoint.length > 1) {
          this.$Message.error('请只保留一个选项');
          return;
        }
        if (this.choosePoint[0].name == '未选择') {
          return;
        }
        this.$router.push({name: 'TaskGroupConfigurationDetail', params: {groupId: this.choosePoint, add: false}})
      },
      add(){
        this.$router.push({name: 'TaskGroupConfigurationDetail', params: {groupId: this.choosePoint, add: true, classifyId: this.classModel}})
      },
      deleteTask(){
        if (this.choosePoint.length > 1) {
          this.$Message.error('请只保留一个选项');
          return;
        }
        if (this.choosePoint[0].name == '未选择') {
          return;
        }
        this.$http.delete(this.$store.state.domain + '/confRelyGroup', {
          params: {
            adoptToken : this.token,
            id: this.choosePoint[0].id
          }
        }).then(res => {
          if (res.data.status == 0) {
            this.$Message.success('删除成功');
            this.closeTag();
            this.selectRelyGet();
          } else {
            this.$Message.error('删除失败');
          }
        });
      },
      reRun(){
        if (this.choosePoint.length > 1) {
          this.$Message.error('请只保留一个选项');
          return;
        }
        this.canRun = true;
        this.$http.get(this.$store.state.domain + '/group/rerun',{
          params:{
            adoptToken : this.token,
            groupId: this.choosePoint[0].id
          }
        }).then(res=>{
            if(res.data.status === 0){
                this.canRun = false;
                this.$Message.success('执行成功');
                this.closeTag();
                this.selectRelyGet();
            }else {
                this.$Message.error('执行失败');
            }
        })
      },
      startTask(status){
          const msg = status?'启用成功':'停用成功';
          this.$http.get(this.$store.state.domain + '/group/handle',{
              params:{
                adoptToken : this.token,
                groupId: this.choosePoint[0].id,
                handle: status?1:0
              }
          }).then(res=>{
              this.$Message.success(msg);
              this.init();
          })
      },
      drawLine(){
        // 基于准备好的dom，初始化echarts实例
        this.myChart = echarts.init(document.getElementById('myChart'));
        this.myChart.setOption(this.options);
        //添加点击事件
        this.myChart.on('click', params => {
          if(!params.data.groupName){
            return;
          }
          if(params.data.groupStatus == 0){
              this.groupBtn = true
              this.groupBtn2 = false
              this.groupBtn3 = true
          }else {
            this.groupBtn = false
            this.groupBtn2 = true
            this.groupBtn3 = false
          }
          if (params.data.groupName == 'root') {
            this.rootBtn = true;
          } else {
            this.rootBtn = false;
          }
          this.btnStatus = false;
          this.canRun = false;
          if (this.choosePoint[0].name == '未选择') {
            this.choosePoint.shift();
          }
          this.agin = false;
          this.choosePoint.forEach((val, i) => {
            if (val.name == params.data.groupName) {
              this.agin = true;
            }
          });
          if (this.agin) {
            return
          }
          this.choosePoint.push({
            name: params.data.groupName,
            id: params.data.pkId
          });
          if(this.choosePoint.length > 1){
              this.groupBtn = true
              this.groupBtn2 = true
              this.groupBtn3 = false
          }
          for (let i in this.chartData) {
            if (this.chartData[i].groupName == params.data.groupName) {
              this.chartData[i].itemStyle.normal.color = '#2d8cf0';
              this.chartData[i].symbolSize = 30;
            }
          }
          this.myChart.setOption({
            series: [{
              // 根据名字对应到相应的系列
              data: this.chartData
            }]
          })
        });
        window.onresize = this.myChart.resize;
      },
      selectChange(val){
        this.oldSelect = val;
        this.myChart.dispatchAction({
          type: 'focusNodeAdjacency',
          dataIndex: val
        });
      },
      queryChange(val){
        if (val == '') {
          this.model11 = '';
          this.myChart.dispatchAction({
            type: 'restore'
          });
        }
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
      .select-wrapper
        width: 100%
        float: right
        height: 40px
        margin-top: 15px
      .btn-wrapper
        margin: 15px 0 60px 10px
        .tag-block
          width: 70%
          display: inline-block
        .btn-block
          width: 400px
          float: right
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
  .selectWrapper
    float: right
    display: inline-block
    span
      font-size: 16px
    .classSelect
      width: 200px
      display: inline-block
</style>
