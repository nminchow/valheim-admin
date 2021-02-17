<template>
  <v-container>
    <v-row class="text-center">

      <v-col class="mb-4" cols="12">
        <h1 class="display-2 font-weight-bold mb-3">
          Valgrind Dashboard
        </h1>

        <p class="subheading font-weight-regular">
          Use the panel below to start and stop the server. After the <br/>
          server's status changes to "Running", it may take a minute or two to<br/>
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
          <v-card-text class="mb-0 pb-0">
          <div>Status</div>
          <p class="display-1 text--primary mb-0">
            {{statusText}}
          </p>
          </v-card-text>
          <v-card-subtitle class="mt-0 pt-0">
            {{upTimeText}}
          </v-card-subtitle>
          <v-card-actions>
            <v-row justify="space-between">
              <v-col>
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
              </v-col>
              <v-col class="d-flex justify-end">
                <template v-if="pending">
                  <v-progress-circular indeterminate></v-progress-circular>
                </template>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
  </v-container>
</template>

<script>
import ky from 'ky';
import timeago from 'epoch-timeago';
import { sentenceCase } from 'sentence-case';

export default {
  name: 'Config',

  data: () => ({
    status: '...',
    pending: false,
    canStart: false,
    canStop: false,
    upTime: 0,
  }),
  mounted() {
    const self = this;
    const setValue = async () => {
      const { status, lastStartTimestamp, lastStopTimestamp } = await ky(
        'https://us-east4-gw2-notifier-test.cloudfunctions.net/status',
      ).json();
      self.upTime = Math.max(Date.parse(lastStartTimestamp), Date.parse(lastStopTimestamp));
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
  computed: {
    upTimeText() {
      // return this.upTime;
      if (this.status === 'RUNNING') {
        return `Started ${timeago(this.upTime)}.`;
      }
      if (this.status === 'TERMINATED') {
        return `Stopped ${timeago(this.upTime)}.`;
      }
      return '...';
    },
    statusText() {
      return sentenceCase(this.status);
    },
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
