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
            Mofify the supply of asset {{ activeAsset.name
              ? `${activeAsset.name} (${activeAsset.id})`
              : activeAsset.id }}
          </h3>
        </v-card-title>
      </v-toolbar>
      <v-card-text>
        <v-select
          v-model="direction"
          :items="directions"
          label="Direction"
          required
        />

        <v-text-field
          v-model="supply"
          class="ma-0 pa-0"
          label="Supply (unit)"
          type="number"
          required
          number
        />

        <v-text-field
          v-model="generationHash"
          class="ma-0 pa-0"
          label="Generation Hash"
          required
        />
        <SendConfirmation
          :tx-send-data="txSendResults"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            flat
            @click="$emit('close')"
          >
            close
          </v-btn>
          <v-btn
            :disabled="disabledSendTransaction"
            color="primary mx-0"
            @click="showDialog"
          >
            Send Transaction
          </v-btn>
        </v-card-actions>
      </v-card-text>
      <Confirmation
        :is-show="isDialogShow"
        :transactions="transactions"
        @transmitTransaction="modifyAsset"
        @close="dialogClosed"
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
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import {
  Deadline,
  MosaicId,
  MosaicSupplyChangeTransaction,
  MosaicSupplyType,
  NetworkType,
  TransactionHttp,
  UInt64,
} from 'nem2-sdk';
import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

export default {
  name: 'AssetModification',
  components: {
    Confirmation,
    SendConfirmation,
  },
  props: {
    visible: Boolean,
    activeAsset: {
      type: Object,
      default() {
        return { id: false, name: false };
      },
    },
  },
  data() {
    return {
      supply: 1,
      dialogDetails: [],
      txSendResults: [],
      disabledSendTransaction: false,
      isDialogShow: false,
      direction: 'Increase',
      directions: ['Increase', 'Decrease'],
      currentGenerationHash: '',
      transactions: [],
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
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
    generationHash: {
      get() {
        return this.application.generationHashes[this.application.activeNode];
      },
      set(value) {
        this.currentGenerationHash = value;
      },
    },
  },
  watch: {
    supply: {
      handler(e) {
        this.disabledSendTransaction = !(parseInt(e, 10) > 0);
      },
    },
  },
  methods: {
    showDialog() {
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Direction',
          value: this.direction,
        },
        {
          icon: 'add',
          key: 'Supply',
          value: this.supply,
        },
      ];
      this.isDialogShow = true;
    },
    modifyAsset() {
      if (!this.wallet.activeWallet) return;
      if (this.directions.indexOf(this.direction) === -1) return;
      const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
        Deadline.create(),
        new MosaicId(this.activeAsset.id),
        MosaicSupplyType[this.direction],
        UInt64.fromUint(parseInt(this.supply, 10)),
        NetworkType.MIJIN_TEST,
      );
      this.transactions = [mosaicSupplyChangeTransaction];
    },
    dialogClosed() {
      this.isDialogShow = false;
      this.dialogDetails = [];
    },
  },
};

</script>
