<template>
  <div class="Java">
    <div class="header">
      <h1>JAVA脚本</h1>
    </div>
    <div class="form-wrapper">
      <Form :model="formItem" :label-width="60" inline>
        <Form-item label="脚本名称">
          <Input v-model="formItem.input1" placeholder="请输入"></Input>
        </Form-item>
        <Form-item label="脚本路径">
          <Input v-model="formItem.input2" placeholder="请输入"></Input>
        </Form-item>
        <Form-item label="开发者">
          <Input v-model="formItem.input3" placeholder="请输入"></Input>
        </Form-item>
        <Button type="primary" @click="search()">搜索</Button>
        <Button style="float: right;" type="success" @click="add()">新增</Button>
      </Form>
    </div>
    <div class="table-wrapper">
      <Table border :columns="columns" :data="data"></Table>
    </div>
    <div class="modal-wrapper">
      <Modal
        v-model="modalVal"
        :title="titleMsg"
        width="700"
        @on-ok="ok"
        @on-cancel="cancel">
        <div class="form-wrapper">
          <Form :model="modalData" :label-width="80">
            <Form-item label="脚本名称">
              <Input v-model="modalData.scriptName" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="脚本key">
              <Input v-model="modalData.scriptKey" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="脚本路径">
              <Input v-model="modalData.scriptPath" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="参数">
              <Input v-model="modalData.presetParam" type="textarea" :autosize="{minRows: 7,maxRows: 10}" placeholder="请输入..."></Input>
            </Form-item>
            <Form-item label="开发者">
              <Input v-model="modalData.personal" placeholder="请输入"></Input>
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
  import Highlight from '../highlight/Highlight.vue'
  export default {
    data () {
      return {
        formItem:{
          input1: '',
          input2: '',
          input3: ''
        },
        columns: [
          {
            title: '脚本ID',
            key: 'pkId',
            width: 80
          },
          {
            title: '脚本名称',
            key: 'scriptName',
            width: 200
          },
          {
            title: '脚本key',
            key: 'scriptKey'
          },
          {
            title: '参数',
            key: 'presetParam',
            width: 500,
            render: (h, params) => {
              return h(Highlight, {
                props: {
                  codeJson: params.row.presetParam
                }
              });
            }
          },
          {
            title: '开发者',
            key: 'personal'
          },
//          {
//            title: '状态',
//            key: 'status',
//            width: 80
//          },
          {
            title: '操作',
            key: 'action',
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
        data: [],
        modalVal: false,
        modalData: {
          scriptName: '',
          scriptKey: '',
          presetParam: '',
          personal: '',
          scriptPath: ''
        },
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        addChange: 'add',
        changeId: '',
        userInfo: [],
        token:'',
        titleMsg: ''
      }
    },
    mounted(){
      this.initParams()
      this.init();
      this.userInfo = lockr.get('userInfo');
      this.modalData.personal = this.userInfo.userName;
    },
    methods: {
      initParams () {
        this.token = this.$cookie.get('etl_adoptToken');
      },
      init(){
        this.getPage()
      },
      getPage(){
        let data = {
          adoptToken : this.token,
          current: this.currentPage,
          size: this.pageSize,
          scriptName: this.formItem.input1,
          scriptPath: this.formItem.input2,
          personal: this.formItem.input3
        };
        this.$http.post(this.$store.state.domain+'/shellScript/page',qs.stringify(data)).then(res=>{
          this.data = res.data.result.result;
          this.totalPages = res.data.result.total;
        })
      },
      show (data) {
        this.titleMsg = '编辑脚本';
        this.modalVal = true;
        this.addChange = 'change';
        this.changeId = data.pkId;
        this.modalData.scriptName = data.scriptName;
        this.modalData.scriptKey = data.scriptKey;
        this.modalData.presetParam = data.presetParam;
        this.modalData.personal = data.personal;
        this.modalData.status = data.status;
        this.modalData.scriptPath = data.scriptPath;
      },
      remove (data) {
        this.$Modal.confirm({
          title: '确认删除该任务吗',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.$http.delete(this.$store.state.domain+'/shellScript',{
              params: {
                adoptToken : this.token,
                id:data.pkId
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
          this.$Message.error('未输入任何查询条件，默认查询全部')
        }
        this.getPage();
      },
      add(){
        this.titleMsg = '新增脚本';
        this.addChange = 'add';
        this.modalVal = true;
      },
      ok(){
        if(this.addChange == 'add'){
          let data = {
            adoptToken : this.token,
            ...this.modalData
          }
          this.$http.post(this.$store.state.domain+'/shellScript',qs.stringify(data)).then(res=>{
            if(res.data.status == 0){
              this.$Message.success('添加成功');
              this.getPage();
              this.cancel();
            }else {
              this.$Message.error('添加失败');
              this.cancel();
            }
          })
        }else if(this.addChange == 'change'){
          this.modalData.pkId = this.changeId;
          let data = {
            adoptToken : this.token,
            ...this.modalData
          }
          this.$http.put(this.$store.state.domain+'/shellScript',qs.stringify(data)).then(res=>{
            if(res.data.status == 0){
              this.$Message.success('修改成功');
              this.getPage();
              this.cancel();
            }else {
              this.$Message.error('修改失败');
              this.cancel();
            }
          })
        }
      },
      cancel(){
        this.modalData= {
          scriptName: '',
          scriptKey: '',
          presetParam: '',
          scriptPath: ''
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
    components:{
      Highlight
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
