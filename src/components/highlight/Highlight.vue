<template>
  <div v-highlight>
        <span v-if="!show">{{codeJson}}</span>
        <pre v-show="show">
          <code>{{isJSON(codeJson) ? JSON.stringify(JSON.parse(codeJson),null,4) : codeJson }}</code>
          <!--<code>{{JSON.stringify(JSON.parse(codeJson),null,'/t')}}</code>-->
        </pre>
  </div>
</template>

<script>
    export default {
      props:['codeJson'],
      data(){
          return{
            show:false
          }
      },
      mounted(){
        this.show = this.isJSON(this.codeJson);
      },
      methods:{
        isJSON(str) {
          if (typeof str == 'string') {
            try {
              JSON.parse(str);
              return true;
            } catch(e) {
              return false;
            }
          }
        }
      }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
</style>
