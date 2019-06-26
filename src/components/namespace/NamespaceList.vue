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
  <v-layout column>
    <v-list
      three-line
      class="py-0"
    >
      <v-slide-y-transition
        group
        tag="v-list"
        class="py-0"
      >
        <template
          v-for="(ns, index) in namespaces
            .namespaces[wallet.activeWallet.name]"
        >
          <v-layout
            :key="ns.name"
            column
          >
            <v-list-tile
              avatar
              ripple
            >
              <v-list-tile-content class="my-2">
                <v-list-tile-title>
                  {{ ns.name }} - <span class="">{{ ns.hexId }}</span>
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <div class="monospaced">
                    {{ ns.expire }}
                    <a
                      v-if="wallet.activeWallet.walletType !== walletTypes.WATCH_ONLY_WALLET
                        && ns.namespaceType === NamespaceType.RootNamespace"
                      @click.stop="wallet.activeWallet.isWatchOnly
                        ? showPasswordInput = true
                        : spawnExtendNamespace(ns.name, ns.endHeight)"
                    >
                      extend
                    </a>
                  </div>
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  <div class="monospaced">
                    {{ ns.type }} {{ ns.alias }}
                  </div>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn
                  icon
                  @click="ns.expand.isExpandMore = !ns.expand.isExpandMore"
                >
                  <v-icon> {{ ns.expand.isExpandMore ? "expand_more" : "expand_less" }} </v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-layout>
              <AliasTransaction
                v-show="ns.expand.isExpandMore"
                class="pa-3"
                :alias-action-type="ns.expand.aliasActionType"
                :namespace-name="ns.expand.namespaceName"
                :current-alias="ns.expand.currentAlias"
                :current-alias-type="ns.expand.currentAliasType"
              />
            </v-layout>
          </v-layout>
          <v-divider
            v-if="index + 1 < namespaces.namespaces[wallet.activeWallet.name].length"
            :key="index"
          />
        </template>
      </v-slide-y-transition>
    </v-list>
    <PasswordInput
      :visible="showPasswordInput"
      :wallet-name="wallet.activeWallet.name"
      :wallet-type="wallet.activeWallet.walletType"
      @close="showPasswordInput = false"
    />
    <NamespaceExtension
      :visible="extendNamespace"
      :namespace-name="currentNamespaceName"
      :end-height="currentNamespaceEndHeight"
      @close="extendNamespace = false"
    />
  </v-layout>
</template>
<script>
import { mapState } from 'vuex';
import { NamespaceType } from 'nem2-sdk';
import { walletTypes } from '../../infrastructure/wallet/wallet-types';

import AliasTransaction from './AliasTransaction.vue';
import PasswordInput from '../wallet/PasswordInput.vue';
import NamespaceExtension from './NamespaceExtension.vue';

export default {
  name: 'NamespaceList',
  components: {
    AliasTransaction,
    PasswordInput,
    NamespaceExtension,
  },
  data() {
    return {
      extendNamespace: false,
      showPasswordInput: false,
      NamespaceType,
      currentNamespaceName: '',
      currentNamespaceEndHeight: 0,
      walletTypes,
    };
  },
  computed: mapState([
    'namespaces',
    'wallet',
  ]),
  methods: {
    spawnExtendNamespace(name, endHeight) {
      this.currentNamespaceName = name;
      this.currentNamespaceEndHeight = endHeight;
      this.extendNamespace = true;
    },
  },
};

</script>
