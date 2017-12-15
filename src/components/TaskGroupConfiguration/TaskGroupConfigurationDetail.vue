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
                <Form-item label="所属任务组" v-if="this.$route.params.add">
                  <Input v-model="fatherName" readonly placeholder="请输入"></Input>
                </Form-item>
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
                  <Input v-model="formItem.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}"  placeholder="请输入"></Input>
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
              <Button type="primary" style="margin-right: 15px;" :disabled="btnStatus||rootBtn" @click="deleteTask">删除</Button>任务组：<Tag style="margin-right: 30px;" :key="item.id" v-for="item in choosePoint" :name="item.name" color="blue" closable @on-close="closeTag" type="border">{{item.name}}</Tag>
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
              agin: false,
              choosePoint: [{name:'未选择'}],
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
                  formatter: function (params) {
                    if (params.data.groupName) {
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
                        type: "solid",
                      }
                    }
//                    ,
//                    itemStyle:{
//                        normal:{
//                            color:'#53a197'
//                        }
//                    }
                  }]
              },
              chartData: [],
              links: [],
              btnStatus: true,
              rootBtn: true,
              myChart: null,
              deletId: 0,
              fatherName: '',
              nameTemp: [],
              addPageGroupId: '',
              token:''
            }
        },
        mounted(){
          this.drawLine();
          this.initParams();
          this.init();
        },
        methods:{
            initParams(){
              this.token = this.$cookie.get('adoptToken');
              if(this.$route.params.add){
                  this.groupId = this.$route.params.groupId;
              }else {
                  this.groupId = this.$route.params.groupId[0].id;
              }
              this.classifyId = this.$route.params.classifyId;
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
                  if(this.groupId == -1){
                    this.fatherName = 'root';
                  }else {
                    let nameTemp = [];
                    let count = 0;
                    let length = this.groupId.length;
                    this.groupId.forEach((item)=> {
                      this.$http.get(this.$store.state.domain+'/group',{
                        params:{
                          adoptToken : this.token,
                          id:item.id
                        }
                      }).then(res=>{
                        count++;
                        let data = res.data.result.result[0];
                        nameTemp.push(data.groupName);
                        if(count == length){
                          this.fatherName = nameTemp.join(',')
                        }
                      });
                    })
                  }
                  return;
              }
              this.$http.get(this.$store.state.domain+'/confRelyTasks',{
                  params:{
                    adoptToken : this.token,
                    id:this.groupId
                  }
              }).then(res=>{
                let data = res.data.result.result;
                for (let i in data){
                  if(data[i].isSuccess == 1){
                    data[i].itemStyle = {};
                    data[i].itemStyle.normal = {};
                    data[i].itemStyle.normal.color = '#17a05e'
                    data[i].message = '成功'
                  }else {
                    data[i].message = '失败'
                  }
                  data[i].name = data[i].tasksName
                }
                data.unshift({
                  name:"root",
                  pkId:"-1",
                  tasksName: "root",
                  itemStyle: {
                    normal: {
                      color: '#17a05e'
                    }
                  }
                });
                for (let i in data){
                  if(data[i].relytasksName == null){data[i].relytasksName = 'root'}
                  this.links.push({
                    "source": data[i].relytasksName,
                    "target": data[i].tasksName
                  })
                }
                if(this.links.length >=1){
                    this.links.shift();
                }
                let dataTemp = [];
                let objTemp = {};
                data.forEach((val) => {
                  if(!objTemp[val.tasksId]){
                      dataTemp.push(val);
                      objTemp[val.tasksId] = -1;
                  }
                });
                this.chartData = dataTemp;
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
                  adoptToken : this.token,
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
              let dataTemp = [];
              this.groupId.forEach((item)=> {
                dataTemp.push(item.id);
              });
              dataTemp = dataTemp.join(',');
              data.fatherId = dataTemp;
              data.classifyId = this.classifyId;
              data.adoptToken = this.token;
              this.$http.post(this.$store.state.domain+'/group',qs.stringify(data)).then(res=>{
                if(res.data.status == 0){
                  this.$Message.success('新增成功');
                  this.groupId = res.data.result.result.pkId;
                }else{
                  this.$Message.error('新增失败');
                }
              });
            }else{
              let data = this.formItem;
              data.pkId = this.groupId;
              data.adoptToken = this.token;
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
          closeTag(ev, name){
            let index = 0;
            this.choosePoint.forEach((val,i)=> {
              if(val.name == name){
                index = i;
              }
            });
            this.choosePoint.splice(index, 1);
            for (let i in this.chartData) {
              if (this.chartData[i].tasksName == name) {
                this.chartData[i].symbolSize = 20;
                console.log(this.chartData)
                if (this.chartData[i].isSuccess == 1) {
                  this.chartData[i].itemStyle.normal.color = '#17a05e'
                } else {
                  this.chartData[i].itemStyle.normal.color = '#c23531'
                }
              }
            }
            this.myChart.setOption({
              series: [{
                // 根据名字对应到相应的系列
                data: this.chartData
              }]
            });
            if(this.choosePoint.length < 1){
              this.choosePoint.push({name:'未选择'})
            }
            if(this.choosePoint[0].name == '未选择'){
              this.btnStatus = true;
              this.rootBtn = false;
            }
          },
          ok(){
            let data = [];
            let dataTemp = [];
            this.choosePoint.forEach((item)=> {
              dataTemp.push(item.id);
            });
            dataTemp = dataTemp.join(',');
            this.targetKeys.forEach((val)=> {
              data.push({
                adoptToken : this.token,
                groupId: this.groupId,
                relytasksId: this.pkId,
                tasksId: val
              })
            });
            data = JSON.stringify(data);
            this.$http.post(this.$store.state.domain+'/confRelyTasks',qs.stringify({entityList:data,fatherId:dataTemp})).then(res=>{
                if(res.data.status == 0){
                    this.$Message.success('新增成功');
                    this.$route.params.add = false;
                    this.targetKeys = [];
                    this.init();
                    this.closeTag();
                    this.getTaskData();
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
            if(this.choosePoint.length > 1){
              this.$Message.error('请只保留一个选项');
              return;
            }
            if(this.choosePoint[0].name == '未选择'){
              return;
            }
            this.deleteId = this.choosePoint[0].id;
            this.$Modal.confirm({
              title: '确认删除该任务吗',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                let data = {
                  adoptToken : this.token,
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
                    this.$Message.success('删除成功');
                    this.init();
                    this.closeTag();
                  }
                });
              },
              onCancel: () => {
                this.$Modal.remove()
              }
            });
          },
          getTaskData () {
            this.$http.get(this.$store.state.domain+'/tasks/unselected',{
                params:{
                  adoptToken : this.token,
                }
            }).then(res=>{
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
              if(!params.data.tasksName){
                  return;
              }
              if(params.data.tasksName == 'root'){
                this.rootBtn = true;
              }else{
                this.rootBtn = false;
              }
              this.btnStatus = false;
              if(this.choosePoint[0].name == '未选择'){
                this.choosePoint.shift();
              }
              this.agin = false;
              this.choosePoint.forEach((val,i)=> {
                if(val.name == params.data.tasksName){
                  this.agin = true;
                }
              });
              if(this.agin){return}
              this.choosePoint.push({
                name:params.data.tasksName,
                id: params.data.tasksId
              });
              for (let i in this.chartData) {
                if (this.chartData[i].tasksName == params.data.tasksName) {
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
