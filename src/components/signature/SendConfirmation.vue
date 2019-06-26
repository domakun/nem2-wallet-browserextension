// Copyright (C) 2019 Contributors as noted in the AUTHORS file
//
// This file is part of nem2-wallet-browserextension.
//
// nem2-wallet-browserextension is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// nem2-wallet-browserextension is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with nem2-wallet-browserextension.  If not, see http://www.gnu.org/licenses/.

<template>
  <v-list
    two-line
    class="py-0"
  >
    <v-slide-y-transition
      group
      tag="v-list"
      class="py-0"
    >
      <template v-for="(result) in results">
        <v-list-tile
          :key="result.txHash"
          avatar
          ripple
        >
          <v-list-tile-content class="my-2">
            <v-list-tile-title>Transaction sent was a success! 🚀</v-list-tile-title>
            <v-list-tile-sub-title class="monospaced-bold">
              Hash:
              <a
                :href="result.txStatusUrl"
                target="_blank"
              >
                {{ result.txHash }}
              </a>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-slide-y-transition>
  </v-list>
</template>

<script>
export default {
  props: {
    txSendData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    results() {
      return this.txSendData.map(result => ({
        txHash: result.txHash,
        txStatusUrl: `${result.nodeURL}/transaction/${result.txHash}/status`,
      }));
    },
  },
};
</script>
