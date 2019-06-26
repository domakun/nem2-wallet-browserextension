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
  <v-layout
    row
    pb-2
    mt-4
  >
    <v-container
      fluid
      pa-0
      ma-0
    >
      <v-flex
        v-if="transactions.receivedURI
          && transactions.receivedURI.length > 0"
        xs12
      >
        <v-alert
          xs12
          class="ma-0 pb-4"
          :value="true"
          type="error"
        >
          CAUTION:  You are about to sign a transaction for an external service.&nbsp;
          Exercise extreme caution and verify all details before proceeding.
        </v-alert>
      </v-flex>
      <v-flex
        xs12
      >
        <UriTransactionList
          v-if="transactions.receivedURI
            && transactions.receivedURI.length > 0"
          :transactions="transactions.receivedURI"
          list-type="uriToValidate"
        />
        <CreateTransferInvoice />
      </v-flex>
    </v-container>
  </v-layout>
</template>
<script>

import { mapState } from 'vuex';
import { Address } from 'nem2-sdk';
import { TransactionURI } from 'nem2-uri-scheme';
import { txTypeNameFromTypeId } from '../../infrastructure/transactions/transactions-types';
import CreateTransferInvoice from './CreateTransferInvoice.vue';
import UriTransactionList from './UriTransactionList.vue';

export default {
  components: {
    CreateTransferInvoice,
    UriTransactionList,
  },
  computed: mapState(['transactions']),
  created() {
    try {
      if (!this.$route.query.transaction) {
        return;
      }
      const transactionQuery = this.$route.query.transaction;
      const transactionURI = TransactionURI.fromURI(transactionQuery);
      const transaction = transactionURI.toTransaction();
      const { generationHash } = transactionURI;

      const formattedMosaics = this.mosaics.map((mosaic) => {
        if (mosaic.id.fullName) {
          return {
            ...mosaic,
            mosaicName: mosaic.id.fullName,
            mosaicAmount: mosaic.amount.compact(),
          };
        }

        if (!this.assets.networkAssets
            || !this.assets.networkAssets[generationHash]) {
          return {
            ...mosaic,
            mosaicName: mosaic.id.toHex(),
            mosaicAmount: mosaic.amount.compact(),
          };
        }

        const networkAsset = this.assets.networkAssets[generationHash]
          .find(netAsset => netAsset.assetId === mosaic.id.toHex());
        return {
          ...mosaic,
          mosaicName: networkAsset.name || networkAsset.assetId,
          mosaicAmount: mosaic.amount.compact(),
        };
      });

      this.$store.dispatch('transactions/SAVE_RECEIVED_URI', {
        uriTransaction: {
          URI: this.$route.query.transaction,
          transaction,
          txRecipient: new Address(transaction.recipient.address).pretty(),
          formattedMosaics,
          txType: txTypeNameFromTypeId(transaction.type),
          generationHash,
          endpoint: transactionURI.endpoint,
          webhook: transactionURI.webhook,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Handler.vue - created', error);
    }
  },
};
</script>
