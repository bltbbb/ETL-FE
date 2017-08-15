<template>
  <div class="Python">
    <div class="header">
      <h1>Python脚本</h1>
    </div>
    <div class="form-wrapper">
      <Form :model="formItem" :label-width="80" inline>
        <Form-item label="脚本名称">
          <Input v-model="formItem.input1" placeholder="请输入"></Input>
        </Form-item>
        <Form-item label="脚本路径">
          <Input v-model="formItem.input2" placeholder="请输入"></Input>
        </Form-item>
        <Form-item label="开发者">
          <Input v-model="formItem.input3" placeholder="请输入"></Input>
        </Form-item>
      </Form>
    </div>
    <div class="table-wrapper">
      <Table border :columns="columns" :data="data"></Table>
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
        columns: [
          {
            title: '脚本ID',
            key: 'pkId',
            width: 100
          },
          {
            title: '脚本名称',
            key: 'scriptName'
          },
          {
            title: '脚本key',
            key: 'scriptKey'
          },
          {
            title: '参数',
            key: 'presetParam',
            width: 500
          },
          {
            title: '开发者',
            key: 'createUser',
            width: 100
          },
          {
            title: '状态',
            key: 'status',
            width: 100
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
                      this.show(params.index)
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
                      this.remove(params.index)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        data: []
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
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .Python
    padding: 0 20px
    .header
      padding-top: 30px
      font-size: 20px
      border-bottom: 1px solid #ccc
      padding-bottom: 5px
    .form-wrapper
      margin-top: 30px
      padding: 15px
    .table-wrapper
      margin-bottom: 30px
</style>
