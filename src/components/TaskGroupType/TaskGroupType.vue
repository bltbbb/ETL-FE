<template>
  <div class="TaskGroupType">
    <div class="header">
      <h1>分类配置</h1>
    </div>
    <div class="form-wrapper">
      <Form :model="formItem" :label-width="60" inline>
        <Form-item label="分类名称">
          <Input v-model="formItem.input1" placeholder="请输入"></Input>
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
            <Form-item label="分类名称">
              <Input v-model="modalData.classifyName" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="分类描述">
              <Input v-model="modalData.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入"></Input>
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
          input1: null
        },
        columns: [
          {
            title: '分类ID',
            key: 'pkId',
            width: 100
          },
          {
            title: '分类名称',
            key: 'classifyName'
          },
          {
            title: '分类描述',
            key: 'remark'
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
          classifyName: '',
          remark: ''
        },
        userInfo: {},
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        addChange: 'add',
        changeId: '',
        canSearch: false
      }
    },
    mounted(){
      this.init();
      this.userInfo = lockr.get('userInfo');
      this.modalData.user = this.userInfo.userName;
    },
    methods: {
      init(){
        this.getPage();
      },
      getPage(){
        let data = {
          current: this.currentPage,
          size: this.pageSize,
          classifyName: this.formItem.input1
        };
        this.$http.post(this.$store.state.domain+'/classify/page',qs.stringify(data)).then(res=>{
          this.tableData = res.data.result.result;
          this.totalPages = res.data.result.total;
        })
      },
      show (data) {
        this.modalVal = true;
        this.addChange = 'change';
        this.canSearch = true;
        this.changeId = data.pkId;
        this.modalData.classifyName = data.classifyName;
        this.modalData.remark = data.remark;
      },
      remove (data) {
        this.$Modal.confirm({
          title: '确认删除该任务吗',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.$http.delete(this.$store.state.domain+'/classify',{
              params:{
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
          this.$http.post(this.$store.state.domain+'/classify',qs.stringify(this.modalData)).then(res=>{
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
          this.$http.put(this.$store.state.domain+'/classify',qs.stringify(this.modalData)).then(res=>{
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
          classifyName: '',
          remark: ''
        }
      },
      add(){
        this.addChange = 'add';
        this.modalVal = true;
        this.canSearch = false;
      },
      pageSizeEv(val){
        this.currentPage = val;
        this.getPage();
      },
      pageSizeChangeEv(val){
        this.pageSize = val;
        this.getPage();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .TaskGroupType
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
