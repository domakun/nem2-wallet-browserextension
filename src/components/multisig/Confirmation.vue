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
    :value="value"
    :max-width="maxWidth"
    @input="toggleDialog"
  >
    <v-card>
      <v-card-title primary-title>
        <h3 class="headline mb-0">
          {{ title }}
        </h3>
        <div>
          {{ body }}
        </div>
      </v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="toggleDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="info"
          @click="signAndAnnounce"
        >
          Yes, send it!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { filter, mergeMap } from 'rxjs/operators';
import {
  TransactionHttp,
  Listener,
  NetworkType,
  Deadline,
  HashLockTransaction,
  NetworkCurrencyMosaic,
  UInt64,
  TransactionType,
} from 'nem2-sdk';

export default {
  name: 'Confirmation',
  props: {
    value: {
      type: Boolean,
      default() {
        return false;
      },
    },
    aggregateTransaction: {
      type: Object,
      default() {
        return {};
      },
    },
    generationHash: {
      type: String,
      default() {
        return '';
      },
    },
    transactionType: {
      type: Number,
      default() {
        return TransactionType.AGGREGATE_COMPLETE;
      },
    },
    title: {
      type: String,
      default() {
        return 'Send this transaction?';
      },
    },
    body: {
      type: String,
      default() {
        return 'Are you sure that you want to send a transaction with the following details?';
      },
    },
    maxWidth: {
      type: Number,
      default() {
        return 500;
      },
    },
    // eslint-disable-next-line vue/require-default-prop
    webhook: {
      type: String,
    },
  },
  computed: mapState([
    'wallet',
    'application',
    'assets',
    'multisig',
  ]),
  methods: {
    toggleDialog() {
      this.$emit('input', !this.value);
    },
    announceCompleteTransaction() {
      const { aggregateTransaction } = this;
      const { account } = this.wallet.activeWallet;
      const node = this.application.activeNode;
      const transactionHttp = new TransactionHttp(this.application.activeNode);
      const signedTransaction = account.sign(aggregateTransaction, this.generationHash);
      this.$emit('sent', {
        txHash: signedTransaction.hash,
        nodeURL: node,
      });
      transactionHttp
        .announce(signedTransaction)
        .subscribe(x => console.log(x), err => console.error(err));
    },
    announceBondedTransaction() {
      const { aggregateTransaction } = this;
      const { account } = this.wallet.activeWallet;
      const node = this.application.activeNode;
      const transactionHttp = new TransactionHttp(this.application.activeNode);
      const listener = new Listener(this.application.activeNode.replace('http', 'ws'), WebSocket);
      const signedTransaction = account.sign(aggregateTransaction, this.generationHash);
      const hashLockTransaction = HashLockTransaction.create(
        Deadline.create(),
        NetworkCurrencyMosaic.createRelative(10),
        UInt64.fromUint(480),
        signedTransaction,
        NetworkType.MIJIN_TEST,
      );
      const hashLockTransactionSigned = account.sign(hashLockTransaction, this.generationHash);
      this.$emit('sent', {
        txHash: hashLockTransactionSigned.hash,
        nodeURL: node,
      });
      this.$emit('sent', {
        txHash: signedTransaction.hash,
        nodeURL: node,
      });
      listener.open().then(() => {
        transactionHttp
          .announce(hashLockTransactionSigned)
          .subscribe(x => console.log(x), err => console.error(err));
        listener
          .confirmed(account.address)
          .pipe(
            filter(transaction => transaction.transactionInfo !== undefined
                  && transaction.transactionInfo.hash === hashLockTransactionSigned.hash),
            mergeMap(ignored => transactionHttp.announceAggregateBonded(signedTransaction)),
          )
          .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
            err => console.error(err));
      });
    },
    signAndAnnounce() {
      console.log(this.transactionType);
      if (this.transactionType === TransactionType.AGGREGATE_BONDED) {
        this.announceBondedTransaction();
      } else {
        this.announceCompleteTransaction();
      }
    },
  },
};
</script>

<style scoped>

</style>
