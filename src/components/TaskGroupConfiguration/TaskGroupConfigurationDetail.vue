<template>
    <div class="TaskGroupConfigurationDetail">
      <div class="header">
        <h1>编辑任务组配置</h1>
      </div>
      <div class="tab-wrapper">
        <Tabs size="small">
          <Tab-pane label="配置">
            <div class="form-wrapper">
              <Form :model="formItem" :label-width="100">
                <Form-item label="任务组名称">
                  <Input v-model="formItem.groupName" placeholder="请输入"></Input>
                </Form-item>
                <Form-item label="有效开始时间">
                  <Date-picker type="datetime" placeholder="选择日期和时间" :value="formItem.effectiveStart" @on-change="startTime" style="width: 200px"></Date-picker>
                </Form-item>
                <Form-item label="有效结束时间">
                  <Date-picker type="datetime" placeholder="选择日期和时间" :value="formItem.effectiveEnd" @on-change="endTime" style="width: 200px"></Date-picker>
                </Form-item>
                <Form-item label="任务分组描述">
                  <Input v-model="formItem.remark" placeholder="请输入"></Input>
                </Form-item>
                <Form-item label="Cron任务表达式">
                  <Input v-model="formItem.tasksCron" placeholder="请输入"></Input>
                </Form-item>
                <!--<Form-item label="选择器">-->
                  <!--<Select v-model="formItem.select" placeholder="请选择">-->
                    <!--<Option value="beijing">北京市</Option>-->
                    <!--<Option value="shanghai">上海市</Option>-->
                    <!--<Option value="shenzhen">深圳市</Option>-->
                  <!--</Select>-->
                <!--</Form-item>-->
                <Form-item label="汇报">
                  <Input v-model="formItem.reportNotice" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入..."></Input>
                </Form-item>
                <Form-item>
                  <Button type="primary" @click="pushChange">提交</Button>
                  <Button type="ghost" style="margin-left: 8px">取消</Button>
                </Form-item>
              </Form>
            </div>
          </Tab-pane>
          <Tab-pane label="依赖">
            <div class="btn-wrapper">
              <Button :disabled="btnStatus" type="primary" @click="addTask">新增</Button>
              <Button type="primary" style="margin-right: 15px;" :disabled="btnStatus||rootBtn" @click="deleteTask">删除</Button>任务组：<Tag style="margin-right: 30px;" color="blue" closable @on-close="closeTag" type="border">{{choosePoint}}</Tag>
            </div>
            <div class="chart-wrapper">
              <div id="myChart"></div>
            </div>
          </Tab-pane>
        </Tabs>
      </div>
      <div class="modal-wrapper">
        <Modal
          v-model="modal"
          title="新增任务依赖"
          width="600"
          @on-ok="ok"
          @on-cancel="cancel">
          <Transfer
            :data="transferData"
            filterable
            :list-style="listStyle"
            :target-keys="targetKeys"
            :filter-method="filterMethod"
            @on-change="handleChange"></Transfer>
        </Modal>
      </div>
    </div>
</template>

<script>
    import qs from 'qs'
    import echarts from 'echarts'

    export default {
        data(){
            return{
              pkId : 0,
              groupId : 0,
              modal: false,
              transferData: [],
              targetKeys: [],
              listStyle: {
                width: '250px',
                height: '300px',
                textAlign: 'left'
              },
              formItem: {
                groupName: '',
                effectiveStart: '',
                effectiveEnd: '',
                remark: '',
                tasksCron: '',
                reportNotice: ''
              },
              options: {
//                title:{
//                  text: "任务组配置",
//                  top: "30",
//                  left: "left"
//                },
                tooltip: {
                  formatter:function (params) {
                    if(params.data.groupName){
                      return `<div><span style="display: inline-block;width: 10px;height:10px;background:#17a03e;margin-right: 10px"></span>任务组名称：${params.data.groupName}<div>`
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
                        type: "solid",
                      }
                    },
                    itemStyle:{
                        normal:{
                            color:'#53a197'
                        }
                    }
                  }]
              },
              chartData: [],
              links: [],
              btnStatus: true,
              rootBtn: true,
              choosePoint: '未选择',
              myChart: null,
              deletId: 0
            }
        },
        mounted(){
          this.drawLine();
          this.initParams();
          this.init();
        },
        methods:{
            initParams(){
              this.groupId = this.$route.params.groupId;
              this.getTaskData();
            },
            init(){
              if(this.$route.params.add){
                  this.chartData = [{
                    name:"root",
                    pkId:"-1",
                    tasksName: "root"
                  }];
                  this.myChart.setOption({
                    series: [{
                      // 根据名字对应到相应的系列
                      data: this.chartData,
                      links: this.links
                    }]
                  });
                  return;
              }
              this.$http.get(this.$store.state.domain+'/confRelyTasks',{
                  params:{
                      id:this.groupId
                  }
              }).then(res=>{
                let data = res.data.result.result;
                for (let i in data){
                  if(data[i].runningState == 1){
                    data[i].itemStyle = {};
                    data[i].itemStyle.normal = {};
                    data[i].itemStyle.normal.color = '#17a05e'
                  }
                  data[i].name = data[i].tasksName
                }
                data.unshift({
                  name:"root",
                  pkId:"-1",
                  tasksName: "root",
                });
                for (let i in data){
                  if(data[i].relytasksName == null){data[i].relytasksName = 'root'}
                  this.links.push({
                    "source": data[i].relytasksName,
                    "target": data[i].tasksName
                  })
                }
                if(this.links.length >1){
                    this.links.shift();
                }
                this.chartData = data;
                this.myChart.setOption({
                  series: [{
                    // 根据名字对应到相应的系列
                    data: this.chartData,
                    links: this.links
                  }]
                });
              });

              this.$http.get(this.$store.state.domain+'/group',{
                params:{
                  id:this.groupId
                }
              }).then(res=>{
                let data = res.data.result.result[0];
                this.formItem.groupName = data.groupName;
                this.formItem.effectiveStart = data.effectiveStart;
                this.formItem.effectiveEnd = data.effectiveEnd;
                this.formItem.remark = data.remark;
                this.formItem.tasksCron = data.tasksCron;
                this.formItem.reportNotice = data.reportNotice;
              });
          },
          pushChange(){
            if(this.$route.params.add){
              let data = this.formItem;
              data.pkId = this.groupId;
              this.$http.post(this.$store.state.domain+'/group',qs.stringify(data)).then(res=>{
                if(res.data.status == 0){
                  this.$Message.success('新增成功');
                }else{
                  this.$Message.error('新增失败');
                }
              });
            }else{
              let data = this.formItem;
              data.pkId = this.groupId;
              this.$http.put(this.$store.state.domain+'/group',qs.stringify(data)).then(res=>{
                if(res.data.status == 0){
                  this.$Message.success('编辑成功');
                  this.init();
                }else{
                  this.$Message.error('编辑失败');
                }
              });
            }
          },
          closeTag(){
            this.btnStatus = true;
            this.choosePoint = '未选择';
            this.rootBtn = true;
          },
          ok(){
            let data = [];
            this.targetKeys.forEach((val)=> {
              data.push({
                groupId: this.groupId,
                relytasksId: this.pkId,
                tasksId: val
              })
            });
            data = JSON.stringify(data);
            this.$http.post(this.$store.state.domain+'/confRelyTasks',qs.stringify({entityList:data})).then(res=>{
                if(res.data.status == 0){
                    this.$Message.success('新增成功');
                    this.targetKeys = [];
                    this.init();
                }else{
                    this.$Message.error('新增失败');
                    this.targetKeys = [];
                }
            });
          },
          cancel(){
            setTimeout(()=> {
              this.targetKeys = []
            },500)
          },
          addTask(){
            this.modal = true;
          },
          deleteTask(){
            this.$Modal.confirm({
              title: '确认删除该任务吗',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                let data = {
                  id: this.deleteId
                };
                this.$http.delete(this.$store.state.domain+'/confRelyTasks',{
                  params:{
                    id: this.deleteId
                  }
                }).then(res=>{
                  if(res.data.status == 1){
                    this.$Message.error('该任务存在子级，禁止删除。')
                  }else {
                    this.$Message.success('删除成功')
                  }
                });
              },
              onCancel: () => {
                this.$Modal.remove()
              }
            });
          },
          getTaskData () {
            this.$http.get(this.$store.state.domain+'/tasks/unselected').then(res=>{
              if(res.data.status == 0){
                let data = res.data.result.result;
                if(!data){
                    this.$Message.error('当前无任务可选。');
                    return;
                }
                data.forEach(function (val,i) {
                  data[i].key = data[i].pkId+'';
                  data[i].label = data[i].tasksName;
                });
                this.transferData = data
              }else {
                  this.$Message.error('网络错误')
              }
            });
          },
          handleChange (newTargetKeys) {
            this.targetKeys = newTargetKeys;
          },
          filterMethod (data, query) {
            return data.label.indexOf(query) > -1;
          },
          startTime(val){
            this.formItem.effectiveStart = val
          },
          endTime(val){
            this.formItem.effectiveEnd = val
          },
          drawLine(){
            // 基于准备好的dom，初始化echarts实例
            this.myChart = echarts.init(document.getElementById('myChart'));
            this.myChart.setOption(this.options);
            //添加点击事件
            this.myChart.on('click', params=> {
              // 弹窗打印数据的名称
              if(params.data.tasksName == 'root'){
                this.rootBtn = true;
              }else{
                this.rootBtn = false;
              }
              this.btnStatus = false;
              this.choosePoint = params.data.tasksName;
              this.pkId = params.data.pkId;
              this.deleteId = this.pkId;
            });
            window.onresize = this.myChart.resize;
          }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .TaskGroupConfigurationDetail
    padding: 0 20px
    .header
      padding-top: 30px
      font-size: 20px
      border-bottom: 1px solid #ccc
      padding-bottom: 5px
    .tab-wrapper
      margin-top: 20px
      .form-wrapper
        padding: 0 15px
    .btn-wrapper
      margin-bottom: 30px
      padding-left: 10px
    #myChart
      width: 100%
      height: 800px
</style>
