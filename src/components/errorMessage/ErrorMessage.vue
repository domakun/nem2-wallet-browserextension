<template>

    <v-card>
      <v-card-title
              class="headline grey lighten-2"
              primary-title
      >
        Lack of necessary information
      </v-card-title>

      <v-card-text>
        <div :key="index" v-for="(e,index) in errorMessage">
          {{e}}
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
                color="primary"
                flat
                @click="hideErrorMessage"
        >
          i see
        </v-btn>
      </v-card-actions>
    </v-card>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    errorMessage: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    hideErrorMessage() {
      this.$emit('hideErrorMessage', false);
    },
  },
};
</script>

<style scoped>

</style>
