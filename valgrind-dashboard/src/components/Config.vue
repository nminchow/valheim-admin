<template>
  <v-container>
    <v-row class="text-center">

      <v-col class="mb-4" cols="12">
        <h1 class="display-2 font-weight-bold mb-3">
          Valgrind Dashboard
        </h1>

        <p class="subheading font-weight-regular">
          Use the buttons below to start and stop the server. After the <br/>
          server's status changes to "running", it may take a minute or two to<br/>
          become connect-able.
        </p>
      </v-col>
    </v-row>
      <v-col
        class="mb-5"
      >
        <v-card
          elevation="2"
          outlined
          tile
          max-width="500"
          class="mx-auto"
        >
          <v-card-text>
          <div>Status</div>
          <p class="display-1 text--primary">
            {{status}}
          </p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              color="primary"
              @click="start"
              :disabled="!canStart"
            >
              Start
            </v-btn>
            <v-btn
              color="error"
              text
              @click="stop"
              :disabled="!canStop"
            >
              Stop
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
  </v-container>
</template>

<script>
import ky from 'ky';

export default {
  name: 'Config',

  data: () => ({
    status: '...',
    pending: false,
    canStart: false,
    canStop: false,
  }),
  mounted() {
    const self = this;
    const setValue = async () => {
      const { status } = await ky(
        'https://us-east4-gw2-notifier-test.cloudfunctions.net/status',
      ).json();
      self.status = status;
      if (status === 'RUNNING' && !self.pending) {
        self.canStop = true;
      }
      if (status === 'TERMINATED' && !self.pending) {
        self.canStart = true;
      }
    };
    setValue();
    window.setInterval(setValue, 10000);
  },
  methods: {
    start() {
      ky('https://us-east4-gw2-notifier-test.cloudfunctions.net/start');
      this.setPending(20);
    },
    stop() {
      ky('https://us-east4-gw2-notifier-test.cloudfunctions.net/stop');
      this.setPending(20);
    },
    setPending(seconds) {
      this.canStart = false;
      this.canStop = false;
      this.pending = true;
      window.setTimeout(() => { this.pending = false; }, seconds * 1000);
    },
  },
};
</script>
