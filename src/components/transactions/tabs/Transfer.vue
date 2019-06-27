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
  <div>
    <Transfer :transactionType="transactionType" class="mb-4" />

    <v-card class="mb-4">
      <v-toolbar
        card
        prominent
      >
        <v-toolbar-title>Holdings</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <AssetList />
      </v-card-text>
    </v-card>

    <Transactions
      v-if="wallet.activeWallet
        && transactions.transactions
        && transactions.transactions[wallet.activeWallet.name]"
      preset-filter="false"
      title="Recent transfers"
      class="mb-4"
    />
  </div>
</template>

<script>
import { TransactionType } from 'nem2-sdk';
import { mapState } from 'vuex';
import Transactions from '../Transactions.vue';
import AssetList from '../../asset/AssetList.vue';
import Transfer from '../../transfer/Transfer.vue';

export default {
  components: {
    AssetList,
    Transactions,
    Transfer,
  },
  computed: mapState(['transactions', 'wallet']),
  data() {
    return {
      transactionType: TransactionType.TRANSFER,
    };
  },
};

</script>
