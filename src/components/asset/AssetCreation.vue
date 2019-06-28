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
            Create an asset
          </h3>
        </v-card-title>
      </v-toolbar>
      <v-card-text>
        <v-text-field
          v-model="supply"
          class="ma-0 pa-0 mt-3"
          label="Supply (unit, Integer in the range of 0 and 9,000,000,000)"
          type="number"
        />
        <v-text-field
          v-model="divisibility"
          class="ma-0 pa-0"
          label="Divisibility (unit, Integer in the range of 0 and 6)"
          type="number"
        />
        <v-text-field
          v-model="duration"
          class="ma-0 pa-0"
          label="Duration (blocks, Fill 0 for unlimited duration)"
          type="number"
        />
        <v-text-field
          v-model="generationHash"
          class="ma-0 pa-0"
          label="Generation Hash"
        />
        <v-switch
          v-model="transferable"
          label="Transferable"
        />
        <v-switch
          v-model="supplyMutable"
          label="Mutable supply"
        />
        <v-switch
          v-model="levyMutable"
          label="Mutable levy"
        />
      </v-card-text>
      <v-layout column>
        <SendConfirmation
          :tx-send-data="txSendResults"
        />
      </v-layout>
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
          @click="createAsset"
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
  AggregateTransaction,
  Deadline,
  MosaicId,
  MosaicDefinitionTransaction,
  MosaicProperties,
  MosaicSupplyChangeTransaction,
  MosaicSupplyType,
  MosaicNonce,
  NetworkType,
  UInt64,
} from 'nem2-sdk';
import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

export default {
  name: 'AssetCreation',
  components: {
    Confirmation,
    SendConfirmation,
  },
  props: {
    visible: Boolean,
  },
  data() {
    return {
      supply: 1,
      divisibility: 0,
      duration: 0,
      supplyMutable: false,
      transferable: false,
      levyMutable: false,
      isDialogShow: false,
      dialogDetails: [],
      txSendResults: [],
      disabledSendTransaction: false,
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
    transferable: {
      handler(e) {
        this.disabledSendTransaction = !(typeof e === 'boolean');
      },
    },
    supplyMutable: {
      handler(e) {
        this.disabledSendTransaction = !(typeof e === 'boolean');
      },
    },
    levyMutable: {
      handler(e) {
        this.disabledSendTransaction = !(typeof e === 'boolean');
      },
    },
    divisibility: {
      handler(e) {
        this.disabledSendTransaction = !(parseInt(e, 10) >= 0 && parseInt(e, 10) <= 6);
      },
    },
    supply: {
      handler(e) {
        this.disabledSendTransaction = !(parseInt(e, 10) > 0 && parseInt(e, 10) <= 9000000000);
      },
    },
    duration: {
      handler(e) {
        this.disabledSendTransaction = !(parseInt(e, 10) >= 0);
      },
    },
  },
  methods: {
    showDialog() {
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Supply',
          value: this.supply,
        },
        {
          icon: 'add',
          key: 'Divisibility',
          value: this.divisibility,
        },
        {
          icon: 'add',
          key: 'Duration (blocks)',
          value: this.duration === 0 ? 'unlimited' : this.duration,
        },
        {
          icon: 'add',
          key: 'Mutable supply',
          value: this.supplyMutable,
        },
        {
          icon: 'add',
          key: 'Mutable levy',
          value: this.levyMutable,
        },
        {
          icon: 'add',
          key: 'Transferable',
          value: this.transferable,
        },
      ];
      this.isDialogShow = true;
    },
    createAsset() {
      if (!this.wallet.activeWallet) return;
      // eslint-disable-next-line prefer-destructuring;
      const { account } = this.wallet.activeWallet;
      const nonce = MosaicNonce.createRandom();

      const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
        Deadline.create(),
        nonce,
        MosaicId.createFromNonce(nonce, account.publicAccount),
        MosaicProperties.create({
          supplyMutable: this.supplyMutable,
          transferable: this.transferable,
          levyMutable: this.levyMutable,
          divisibility: parseInt(this.divisibility, 10),
          duration: this.duration === 0
            ? undefined
            : UInt64.fromUint(parseInt(this.duration, 10)),
        }),
        NetworkType.MIJIN_TEST,
      );

      const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
        Deadline.create(),
        mosaicDefinitionTransaction.mosaicId,
        MosaicSupplyType.Increase,
        UInt64.fromUint(parseInt(this.supply, 10)),
        NetworkType.MIJIN_TEST,
      );

      const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(),
        [
          mosaicDefinitionTransaction.toAggregate(account.publicAccount),
          mosaicSupplyChangeTransaction.toAggregate(account.publicAccount),
        ],
        NetworkType.MIJIN_TEST,
        [],
      );
      this.transactions = [aggregateTransaction];
      this.showDialog();
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
  },

};

</script>
