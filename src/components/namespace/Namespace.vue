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
    <v-flex
      xs12
    >
      <Errors />
      <v-card
        v-if="wallet.wallets.length > 0
          && wallet.activeWallet
          && !application.error"
        style="height: auto;padding:0 !important"
        class="card--flex-toolbar"
      >
        <v-toolbar
          card
          prominent
        >
          <v-toolbar-title>Namespaces</v-toolbar-title>
          <v-spacer />

          <v-btn
            icon
            @click.stop="reloadList({
              wallet: wallet.activeWallet,
              mode: GET_NAMESPACES_MODES.RELOAD
            })"
          >
            <v-icon>refresh</v-icon>
          </v-btn>

          <v-btn
            icon
            :disabled="wallet.activeWallet.walletType === walletTypes.WATCH_ONLY_WALLET"
            @click.stop="wallet.activeWallet.isWatchOnly
              ? showPasswordInput = true : registerNamespace = true"
          >
            <v-icon>add_box</v-icon>
          </v-btn>
          <v-btn
            href="https://nemtech.github.io/concepts/namespace.html"
            target="_new"
            icon
          >
            <v-icon>local_library</v-icon>
          </v-btn>
        </v-toolbar>

        <v-spacer />
        <v-card-text>
          <div
            v-if="wallet.wallets.length > 0
              && wallet.activeWallet
              && !application.error"
          >
            <div v-if="namespaces.loading_getNamespacesByAddress">
              <v-progress-linear :indeterminate="true" />
            </div>
            <div
              v-if="!namespaces.loading_getNamespacesByAddress
                && namespaces.namespaces[wallet.activeWallet.name]
                && namespaces.namespaces[wallet.activeWallet.name].length === 0"
            >
              <v-flex xs12>
                <v-alert
                  :value="true"
                  type="info"
                >
                  This account does not own any namespace.
                </v-alert>
              </v-flex>
            </div>
            <div
              v-if="!namespaces.loading_getNamespacesByAddress
                && namespaces.namespaces[wallet.activeWallet.name]
                && namespaces.namespaces[wallet.activeWallet.name].length > 0"
            >
              <NamespaceList class="my-2" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
    <PasswordInput
      :visible="showPasswordInput"
      :wallet-name="wallet.activeWallet.name"
      :wallet-type="wallet.activeWallet.walletType"
      @close="showPasswordInput = false"
    />
    <NamespaceRegistration
      :visible="registerNamespace"
      @close="registerNamespace = false"
    />
  </v-layout>
</template>
<script>
import { mapState } from 'vuex';
import store from '../../store/index';
import { walletTypes } from '../../infrastructure/wallet/wallet-types';
import { GET_NAMESPACES_MODES } from '../../infrastructure/namespaces/namespaces-types';

import Errors from '../Errors.vue';
import NamespaceList from './NamespaceList.vue';
import PasswordInput from '../wallet/PasswordInput.vue';
import NamespaceRegistration from './NamespaceRegistration.vue';

export default {
  name: 'Namespace',
  store,
  components: {
    Errors,
    NamespaceList,
    PasswordInput,
    NamespaceRegistration,
  },
  data() {
    return {
      GET_NAMESPACES_MODES,
      walletTypes,
      showPasswordInput: false,
      registerNamespace: false,
    };
  },
  computed: mapState([
    'wallet',
    'application',
    'namespaces',
  ]),
  methods: {
    reloadList({ wallet, mode }) {
      this.$store.dispatch('namespaces/GET_NAMESPACES_BY_ADDRESS',
        { wallet, mode });
    },
  },
};
</script>
<style scoped>
</style>
