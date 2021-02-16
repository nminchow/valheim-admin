<template>
  <v-app>
    <v-app-bar
      app
      color="secondary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo.webp')"
          transition="scale-transition"
          width="120"
        />

      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://www.valheimgame.com/"
        target="_blank"
        text
      >
        <span class="mr-2">Official Site</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Config/>
    </v-main>
  </v-app>
</template>

<script>
import Config from './components/Config.vue';

export default {
  name: 'App',

  components: {
    Config,
  },

  data: () => ({
    //
  }),
};
</script>
