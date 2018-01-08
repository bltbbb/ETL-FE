<template>
    <div class="Login">
      <div class="form-wrapper">
        <div class="form">
          <h1>系统登录</h1>
          <Form ref="formData" :model="formData" :rules="ruleInline">
            <Form-item prop="user">
              <Input type="text" v-model="formData.user" placeholder="Username">
              <Icon type="ios-person-outline" slot="prepend"></Icon>
              </Input>
            </Form-item>
            <Form-item prop="password">
              <Input type="password" v-model="formData.password" placeholder="Password">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
              </Input>
            </Form-item>
            <Form-item>
              <Button long size="large" type="primary" @click="handleSubmit('formData')">登录</Button>
            </Form-item>
          </Form>
        </div>
      </div>
      <transition name="fade-in">
        <div id="screen" v-show="showScreen">
          <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
          </div>
        </div>
      </transition>
    </div>
</template>

<script>
    import qs from 'qs'
    import lockr from 'lockr'
    export default {
      data () {
        return {
          showScreen: false,
          formData: {
            user: '',
            password: ''
          },
          ruleInline: {
            user: [
              { required: true, message: '请填写用户名', trigger: 'blur' }
            ],
            password: [
              { required: true, message: '请填写密码', trigger: 'blur' },
              { type: 'string', min: 5, message: '密码长度不能小于6位', trigger: 'blur' }
            ]
          }
        }
      },
      methods: {
        handleSubmit(name) {
          this.$refs[name].validate((valid) => {
            if (valid) {
              let data ={
                  userName: this.formData.user,
                  passWord: this.formData.password
              };
              this.$http.post(this.$store.state.domain+'/user/login',qs.stringify(data)).then(res=>{
                  if(res.data.status == 0){
                    this.$cookie.set('adoptToken', res.data.result.adoptToken, 1);
//                    this.$cookie.set('adoptToken', res.data.result.adoptToken, { expires: '30s' });
                    this.$store.state.userInfo = res.data.result;
                    lockr.set("userInfo",res.data.result);      //将数据存入localStorage 以便免登陆应用
                    this.$router.push('/Content/Java');
                    this.$Message.success('提交成功!');
                  }else if(res.data.status == 2){
                    this.$Message.error('账号或密码错误!');
                  }
              });
            } else {
              this.$Message.error('请按规则填写!');
            }
          })
        }
      }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .Login
    width: 100%
    height: 100vh
    overflow: hidden
    background: #2d3a4b
    .form-wrapper
      border-radius: 6px
      border: 1px solid #000000
      width: 430px
      margin: 150px auto
      .form
        width: 100%
        padding: 60px
        border-radius: 6px
        border: 1px solid #595959
        h1
          font-size: 26px
          color: #eee
          text-align: center
          padding-bottom: 50px
        button
          margin-top: 10px
</style>
