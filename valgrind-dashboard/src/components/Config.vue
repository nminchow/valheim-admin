<template>
  <v-container>
    <v-row class="text-center">

      <v-col class="mb-4" sm="8" offset-sm="2">
        <h1 class="display-2 font-weight-bold mb-3">
          Valgrind Dashboard
        </h1>

        <p class="subheading font-weight-regular">
          Use the panel below to start and stop the server. After the
          server's status changes to "Running", it may take a minute or two to
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
            {{upTime}}
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
                <v-dialog
                  v-model="dialog"
                  width="500"
                  overlay-color="error"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="warning"
                      text
                      v-bind="attrs"
                      v-on="on"
                      :disabled="!canStop"
                    >
                      Stop
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title class="headline">
                      Have you saved?
                    </v-card-title>
                    <v-card-text>
                      The server only saves every 20 minutes. Ensure
                      you have saved before terminating the server. To save, open
                      the admin console (f5) and issue the "save"
                      command.
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="warning"
                        text
                        @click="dialog = false;"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="error"
                        text
                        @click="stop"
                      >
                        Dew it
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
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
      <v-col
        class="mb-5"
      >
        <!-- <v-card
          elevation="2"
          outlined
          tile
          class="mx-auto"
        > -->
        <Logs :entries="entries" />
        <!-- </v-card> -->
      </v-col>
  </v-container>
</template>

<script>
import ky from 'ky';
import timeago from 'epoch-timeago';
import { sentenceCase } from 'sentence-case';
import Logs from './Logs.vue';

export default {
  name: 'Config',

  data: () => ({
    status: '...',
    pending: false,
    canStart: false,
    canStop: false,
    upTime: '...',
    dialog: false,
    entries: [],
  }),
  components: {
    Logs,
  },
  mounted() {
    const self = this;
    const setValue = async () => {
      const { vmStatus: { status, lastStartTimestamp, lastStopTimestamp }, entries } = await ky(
        'https://us-east4-gw2-notifier-test.cloudfunctions.net/status',
      ).json();
      this.entries = entries;
      const recentTime = Math.max(Date.parse(lastStartTimestamp), Date.parse(lastStopTimestamp));
      this.canStart = false;
      this.canStop = false;
      self.status = status;
      if (status === 'RUNNING' && !self.pending) {
        if (!self.pending) {
          self.canStop = true;
        }
        self.upTime = `Started ${timeago(recentTime)}.`;
        return;
      }
      if (status === 'TERMINATED' && !self.pending) {
        if (!self.pending) {
          self.canStart = true;
        }
        self.upTime = `Stopped ${timeago(recentTime)}.`;
        return;
      }
      self.upTime = '...';
    };
    setValue();
    window.setInterval(setValue, 10000);
  },
  computed: {
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
      this.dialog = false;
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
