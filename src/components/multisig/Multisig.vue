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
      <v-layout
        column
        xs12
      >
        <v-flex
          xs12
        >
          <Errors class="mb-4" />
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
              <v-toolbar-title>Multisig actions</v-toolbar-title>
            </v-toolbar>

            <v-tabs
              v-model="activeTab"
              fixed-tabs
              slider-color="primary"
              class="mb-4"
            >
              <v-tab>
                Convert To Multisig
              </v-tab>
              <v-tab>
                Modify Multisig
              </v-tab>
              <v-tab>
                Cosign Multisig Transactions
              </v-tab>
              <v-tab-item
                v-if="!(wallet.wallets.length > 0
                  && wallet.activeWallet
                  && !wallet.activeWallet.isWatchOnly)"
              >
                <v-layout
                  row
                  pb-2
                  mt-4
                >
                  <v-container
                    fluid
                    pl-5
                    pr-5
                    ma-0
                  >
                    <v-layout
                      column
                      xs12
                    >
                      <v-flex
                        xs12
                      >
                        <Errors
                          :watch-only-warning="true"
                          :application-warnings="false"
                          class="mb-4"
                        />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-layout>
              </v-tab-item>

              <v-tab-item
                v-if="wallet.wallets.length > 0
                  && wallet.activeWallet
                  && !wallet.activeWallet.isWatchOnly"
              >
                <v-card flat>
                  <MultisigConversion
                    @closeComponent="multisigConversion = false"
                  />
                </v-card>
              </v-tab-item>

              <v-tab-item
                v-if="wallet.wallets.length > 0
                  && wallet.activeWallet
                  && !wallet.activeWallet.isWatchOnly"
              >
                <v-card flat>
                  <MultisigModification
                    class="my-2"
                    @closeComponent="multisigModification = false"
                  />
                </v-card>
              </v-tab-item>

              <v-tab-item
                v-if="wallet.wallets.length > 0
                  && wallet.activeWallet
                  && !wallet.activeWallet.isWatchOnly"
              >
                <v-card flat>
                  <MultisigCosignation
                    :loading-get-multisig-info="multisig.loading_getMultisigInfo"
                  />
                </v-card>
              </v-tab-item>

              <!-- <v-tab-item>
                <v-card flat>
                  <OtherMultisigTransactions
                          :loading-get-multisig-info="multisig.loading_getMultisigInfo"
                  />
                </v-card>
              </v-tab-item> -->
            </v-tabs>
          </v-card>

          <MultisigAccountInfo class="mb-4" />
        </v-flex>
      </v-layout>
    </v-container>
  </v-layout>
</template>
<script>

import { mapState } from 'vuex';
import Errors from '../Errors.vue';
import MultisigConversion from './MultisigConversion.vue';
import MultisigModification from './MultisigModification.vue';
import MultisigAccountInfo from './MultisigAccountInfo.vue';
import MultisigCosignation from './MultisigCosignation.vue';
import OtherMultisigTransactions from './OtherMultisigTransactions.vue';

export default {
  components: {
    Errors,
    MultisigConversion,
    MultisigModification,
    MultisigCosignation,
    MultisigAccountInfo,
    // eslint-disable-next-line vue/no-unused-components
    OtherMultisigTransactions,
  },
  data() {
    return {
      activeTab: 0,
      multisigConversion: false,
      multisigModification: false,
      multisignTransactions: false,
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
      'multisig',
    ], {
      wallet: state => state.wallet,
    }),
  },
};

</script>
