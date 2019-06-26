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
  <v-dialog
    v-model="show"
    max-width="680px"
  >
    <v-card>
      <v-toolbar card>
        <v-card-title primary-title>
          <h3 class="headline mb-3">
            Extend namespace {{ namespaceName }}
          </h3>
        </v-card-title>
        <v-spacer />
        <v-btn
          href="https://nemtech.github.io/guides/namespace/extending-a-namespace-registration-period.html"
          target="_new"
          icon
        >
          <v-icon>local_library</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <h3 class="headline mb-5">
          {{ expiration(application.blockNumber, endHeight) }}
        </h3>
        <v-text-field
          v-model="duration"
          class="my-2 pa-0"
          label="Duration increase, in blocks"
          required
          number
        />
        <v-layout column>
          <SendConfirmation
            :tx-send-data="txSendResults"
          />
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          flat
          @click="$emit('close')"
        >
          Close
        </v-btn>
        <v-btn
          :disabled="!(duration > 0)"
          color="primary mx-0"
          @click="showDialog"
        >
          Send Transaction
        </v-btn>
      </v-card-actions>
    </v-card>
    <Confirmation
      v-model="isDialogShow"
      :transactions="transactions"
      :generation-hash="application.generationHashes[application.activeNode]"
      @sent="txSent"
      @error="txError"
    >
      <v-list>
        <v-list-tile
          v-for="detail in dialogDetails"
          :key="detail.key"
        >
          <v-list-tile-action>
            <v-icon>{{ detail.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ detail.key }}: {{ detail.value }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </Confirmation>
  </v-dialog>
</template>
<script>
import { mapState } from 'vuex';
import {
  NetworkType, RegisterNamespaceTransaction, Deadline, UInt64,
} from 'nem2-sdk';

import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

export default {
  components: {
    Confirmation,
    SendConfirmation,
  },
  props: {
    visible: Boolean,
    namespaceName: {
      type: String,
      required: true,
    },
    endHeight: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      duration: 0,
      transactions: [],
      isDialogShow: false,
      dialogDetails: [],
      txSendResults: [],
    };
  },
  computed: {
    ...mapState([
      'application',
      'wallet',
    ]),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      },
    },
  },
  methods: {
    showDialog() {
      const { duration, namespaceName } = this;
      const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
        Deadline.create(),
        namespaceName,
        UInt64.fromUint(duration),
        NetworkType.MIJIN_TEST,
      );

      this.transactions = [registerNamespaceTransaction];
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Additional duration',
          value: this.duration,
        },
      ];
      this.isDialogShow = true;
    },
    txSent(result) {
      this.txSendResults.push({
        txHash: result.txHash,
        nodeURL: result.nodeURL,
      });
    },
    txError(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    },
    expiration(blockNumber, endHeight) {
      if (!(blockNumber > 0)) return `This namespace expires at height ${endHeight.toLocaleString()}`;
      const expiresIn = endHeight - blockNumber;
      if (expiresIn > 0) return `This namespace expires in ${expiresIn.toLocaleString()} blocks.`;
      return `This namespace has been expired for ${expiresIn.toLocaleString() * -1} blocks.`;
    },
  },
};
</script>
