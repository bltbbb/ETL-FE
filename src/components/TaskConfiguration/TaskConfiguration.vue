<template>
  <div class="Java">
    <div class="header">
      <h1>任务配置</h1>
    </div>
    <div class="form-wrapper">
      <Form :model="formItem" :label-width="60" inline>
        <Form-item label="脚本名称">
          <Input v-model="formItem.input1" placeholder="请输入"></Input>
        </Form-item>
        <Form-item label="scriptPath">
          <Input v-model="formItem.input2" placeholder="请输入"></Input>
        </Form-item>
        <Button type="primary" @click="search">搜索</Button>
        <Button style="float: right;" type="success" @click="add">新增</Button>
      </Form>
    </div>
    <div class="table-wrapper">
      <Table border :columns="columns" :data="tableData"></Table>
    </div>
    <div class="modal-wrapper">
      <Modal
        v-model="modalVal"
        title="编辑任务配置"
        @on-ok="ok"
        width="600"
        @on-cancel="cancel">
        <div class="form-wrapper">
          <Form :model="modalData" :label-width="100">
            <Form-item label="任务名称">
              <Input v-model="modalData.tasksName" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="脚本类型">
              <Select :disabled="canSearch" v-model="modalData.scriptType">
                <Option value="1" >Java</Option>
                <Option value="2" >Python</Option>
                <Option value="3" >Shell</Option>
              </Select>
            </Form-item>
            <Form-item label="脚本">
              <Select :disabled="canSearch" v-model="modalData.scriptId" :filterable="!canSearch">
                <Option v-for="item in scriptList" :value="item.pkId" :key="item.pkId">{{ item.scriptName }}</Option>
              </Select>
            </Form-item>
            <Form-item label="调度任务描述">
              <Input v-model="modalData.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="任务耗时">
              <Input-number v-model="modalData.takeEval" placeholder="请输入"></Input-number>&nbsp;&nbsp;&nbsps
            </Form-item>
            <Form-item label="延迟警告">
              <Input v-model="modalData.alarmNotice" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入..."></Input>
            </Form-item>
          </Form>
        </div>
      </Modal>
    </div>
    <div class="page-wrapper">
      <Page :total="totalPages" :current="currentPage" :page-size="pageSize" @on-change="pageSizeEv" @on-page-size-change="pageSizeChangeEv"  show-elevator show-sizer placement="top" :page-size-opts="[10,20,50]"></Page>
    </div>
  </div>
</template>

<script>
  import qs from 'qs'
  import lockr from 'lockr'
  export default {
    data () {
      return {
        formItem:{
          input1: null,
          input2: null,
        },
        columns: [
          {
            title: '任务ID',
            key: 'scriptId',
            width: 100
          },
          {
            title: '任务名称',
            key: 'tasksName',
            width: 240
          },
          {
            title: 'scriptPath',
            key: 'scriptPath',
            width: 350
          },
          {
            title: '调度任务描述',
            key: 'remark',
            width: 260
          },
          {
            title: '任务耗时',
            key: 'takeEval',
            width: 100
          },
          {
            title: '延迟警告',
            key: 'alarmNotice'
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.show(params.row)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        tableData: [],
        modalVal: false,
        modalData: {
          tasksName: '',
          remark: '',
          alarmNotice: '',
          scriptType: '',
          takeEval:0,
          scriptId: ''
        },
        userInfo: {},
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        scriptList: this.scriptListFn(),
        addChange: 'add',
        changeId: '',
        token:'',
        canSearch: false
      }
    },
    mounted(){
      this.initParams()
      this.init();
      this.userInfo = lockr.get('userInfo');
      this.modalData.user = this.userInfo.userName;
    },
    methods: {
      initParams () {
        this.token = this.$cookie.get('etl_adoptToken');
      },
      init(){
        this.getPage();
      },
      getPage(){
        let data = {
          adoptToken : this.token,
          current: this.currentPage,
          size: this.pageSize,
          tasksName: this.formItem.input1,
          scriptPath: this.formItem.input2
        };
        this.$http.post(this.$store.state.domain+'/tasks/page',qs.stringify(data)).then(res=>{
          this.tableData = res.data.result.result;
          this.totalPages = res.data.result.total;
        })
      },
      show (data) {
        this.modalVal = true;
        this.addChange = 'change';
        this.canSearch = true;
        this.changeId = data.pkId;
        this.modalData.tasksName = data.tasksName;
        this.modalData.remark = data.remark;
        this.modalData.alarmNotice = data.alarmNotice;
        this.modalData.scriptType = data.scriptType+'';
        this.modalData.takeEval = data.takeEval;
        this.modalData.scriptId = data.scriptId;
      },
      remove (data) {
        this.$Modal.confirm({
          title: '确认删除该任务吗',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.$http.delete(this.$store.state.domain+'/tasks',{
              params:{
                adoptToken : this.token,
                id: data.pkId
              }
            }).then(res=>{
              if(res.data.status == 0){
                this.$Message.success('删除成功');
                this.getPage();
              }else {
                this.$Message.error('删除失败');
              }
            })
          },
          onCancel: () => {
            this.$Modal.remove()
          }
        });

      },
      search(){
        if(this.formItem.input1 == '' && this.formItem.input2 == '' && this.formItem.input3 == ''){
          this.$Message.error('未输入任何查询条件')
          return;
        }
        this.getPage();
      },
      ok(){
        if(this.addChange == 'add'){
          let data = {
            adoptToken : this.token,
            ...this.modalData
          }
          this.$http.post(this.$store.state.domain+'/tasks',qs.stringify(data)).then(res=>{
            if(res.data.status == 0){
              this.$Message.success('新增成功');
              this.getPage();
              this.cancel();
            }else {
              this.$Message.error('新增失败,'+res.data.result.result.message);
              this.cancel();

            }
          })
        }else if(this.addChange == 'change'){
          this.modalData.pkId = this.changeId;
          let data = {
            adoptToken : this.token,
            ...this.modalData
          }
          this.$http.put(this.$store.state.domain+'/tasks',qs.stringify(data)).then(res=>{
            if(res.data.status == 0){
              this.$Message.success('修改成功');
              this.getPage();
              this.cancel();
            }else {
              this.$Message.error('修改失败,'+res.data.result.result.message);
              this.cancel();
            }
          })
        }

      },
      cancel(){
        this.modalData= {
            tasksName: '',
            remark: '',
            alarmNotice: '',
            scriptType: '',
            takeEval:0,
            scriptId: ''
        }
      },
      add(){
          this.addChange = 'add';
          this.modalVal = true;
          this.canSearch = false;
      },
      scriptListFn(val){
        if(val == 1){
          this.$http.get(this.$store.state.domain+'/javaScript',{
              params:{
                adoptToken : this.token,
              }
          }).then(res=>{
            this.scriptList = res.data.result.result;
          })
        }else if(val == 2){
          this.$http.get(this.$store.state.domain+'/pythonScript',{
            params:{
              adoptToken : this.token,
            }
          }).then(res=>{
            this.scriptList = res.data.result.result;
          })
        }else if(val == 3){
          this.$http.get(this.$store.state.domain+'/shellScript',{
            params:{
              adoptToken : this.token,
            }
          }).then(res=>{
            this.scriptList = res.data.result.result;
          })
        }
      },
      pageSizeEv(val){
        this.currentPage = val;
        this.getPage();
      },
      pageSizeChangeEv(val){
        this.pageSize = val;
        this.getPage();
      }
    },
    watch:{
      'modalData.scriptType':function (val) {
          this.scriptListFn(val)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .Java
    padding: 0 20px
    .header
      padding-top: 30px
      font-size: 20px
      border-bottom: 1px solid #ccc
      padding-bottom: 5px
    .form-wrapper
      margin-top: 30px
      padding: 15px 0
    .table-wrapper
      margin-bottom: 30px
    .page-wrapper
      text-align: center
      margin: 30px 0 35px
</style>
