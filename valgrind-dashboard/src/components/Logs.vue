<template>
  <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Time
            </th>
            <th class="text-left">
              Log
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in entries"
            :key="entry.insertId"
          >
            <td>{{ getTime(entry.timestamp) }}</td>
            <td>{{ getEntry(entry) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
</template>

<script>

export default {
  name: 'Logs',
  props: ['entries'],
  data: () => ({
  }),
  methods: {
    getTime({ seconds, nanos }) {
      return new Date(seconds * 1000 + nanos / 1000000).toISOString();
    },
    getEntry(entry) {
      return entry.jsonPayload?.fields?.message?.stringValue
         || entry.jsonPayload?.fields?.MESSAGE?.stringValue;
    },
  },
};
</script>
