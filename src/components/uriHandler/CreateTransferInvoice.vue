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
  <v-container
    fluid
    pa-0
    ma-0
  >
    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <Errors
          :watch-only-warning="true"
          :application-warnings="false"
          class="mb-4"
        />
        <v-card
          v-if="wallet.wallets.length > 0
            && wallet.activeWallet"
          style="height: auto;padding:0 !important"
          class="card--flex-toolbar"
        >
          <v-toolbar
            card
            prominent
          >
            <v-toolbar-title>Create an URI invoice</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-flex xs12>
              <v-form lazy-validation>
                <v-text-field
                  v-model="txRecipient"
                  required
                  label="Recipient"
                />

                <v-text-field
                  v-model="txAmount"
                  placeholder="ex. 10"
                  type="number"
                  label="Amount (cat.currency)"
                  required
                />

                <v-text-field
                  v-model="endpoint"
                  label="Endpoint"
                  type="text"
                  required
                />

                <v-text-field
                  v-model="generationHash"
                  label="Generation Hash"
                  type="text"
                  required
                />

                <v-checkbox
                  v-model="checkbox"
                  label="Sending other assets?"
                />
                <v-flex
                  v-if="checkbox"
                  sm
                  class="ma-4"
                >
                  <v-text-field
                    v-model="currentMosaicName"
                    label="Asset ID"
                  />

                  <v-layout row>
                    <v-flex xs-11>
                      <v-text-field
                        v-model="currentMosaicAmount"
                        label="Asset Amount"
                      />
                    </v-flex>

                    <v-flex xs-1>
                      <v-btn
                        :disabled="currentMosaicName === ''"
                        color="primary"
                        @click="addMosaic"
                      >
                        <v-icon>add</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                  <template v-for="(mosaic, index) in mosaics">
                    <v-list
                      :key="index"
                      two-line
                    >
                      <v-list-tile v-if="!(mosaic.id.toHex() == '85bbea6cc462b244')">
                        <v-list-tile-action>
                          <v-icon>group_work</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ mosaic.id.toHex() }}
                          <v-subheader>
                            Amount: {{ mosaic.amount.compact() }}
                          </v-subheader>
                        </v-list-tile-content>
                        <v-btn
                          fab
                          small
                          color="error"
                          @click="removeMosaic(index)"
                        >
                          <v-icon>remove</v-icon>
                        </v-btn>
                      </v-list-tile>
                    </v-list>
                  </template>
                </v-flex>
                <v-spacer />

                <v-text-field
                  v-model="txMessage"
                  label="Message"
                />
              </v-form>
            </v-flex>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :disabled="txRecipient === ''"
                flat
                @click="dialog = true"
              >
                Create URI
              </v-btn>
            </v-card-actions>
            <div class="mt-4" />
            <v-dialog
              v-model="dialog"
              max-width="500"
            >
              <v-card>
                <v-card-title class="headline">
                  Create this URI invoice?
                </v-card-title>
                <v-card-text>
                  Please double-check the URI details
                  <v-list>
                    <v-list-tile>
                      <v-list-tile-action>
                        <v-icon>person_outline</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-content>
                        <v-list-tile-title>Recipient: {{ txRecipient }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                      <v-list-tile-action>
                        <v-icon>monetization_on</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-content>
                        <v-list-tile-title>Amount: {{ txAmount }} XEM</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                      <v-list-tile-action>
                        <v-icon>message</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-content>
                        <v-list-tile-title>Message: {{ txMessage }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                  <template v-for="(mosaic) in mosaics">
                    <v-list :key="mosaic.id.toHex()">
                      <v-list-tile v-if="!(mosaic.id.toHex() == '85bbea6cc462b244')">
                        <v-list-tile-action>
                          <v-icon>group_work</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Asset Attached: {{ mosaic.amount.compact() }} {{ mosaic.id.toHex() }}
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </template>
                </v-card-text>

                <v-card-actions>
                  <v-spacer />

                  <v-btn
                    flat
                    @click="dialog = false"
                  >
                    Cancel
                  </v-btn>

                  <v-btn
                    flat
                    @click="createTransactionURI"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <UriTransactionList
      v-if="transactions.createdURI[wallet.activeWallet.name]
        && transactions.createdURI[wallet.activeWallet.name].length > 0"
      :transactions="transactions.createdURI[wallet.activeWallet.name]"
      list-type="createdUri"
    />
  </v-container>
</template>

<script>
import {
  NetworkType,
  TransferTransaction,
  Deadline,
  Address,
  PlainMessage,
  NetworkCurrencyMosaic,
  UInt64,
  TransactionHttp,
  MosaicId,
  Mosaic,
} from 'nem2-sdk';

import { TransactionURI } from 'nem2-uri-scheme';
import { mapState } from 'vuex';
import { txTypeNameFromTypeId } from '../../infrastructure/transactions/transactions-types';
import store from '../../store/index';

import Errors from '../Errors.vue';
import UriTransactionList from './UriTransactionList.vue';

export default {
  components: {
    Errors,
    UriTransactionList,
  },
  store,
  data() {
    return {
      txMessage: '',
      txAmount: 0,
      dialog: false,
      checkbox: false,
      mosaics: [],
      currentMosaicName: '',
      currentMosaicAmount: '',
      txRecipient: '',
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'transactions',
      'application',
      'assets',
    ]),
    activeWallet() {
      return this.$store.getters['wallet/GET_ACTIVE_WALLET'];
    },
    transactionHttp() {
      return new TransactionHttp(this.application.activeNode);
    },
    endpoint() {
      return this.application.activeNode;
    },
    generationHash: {
      get() {
        return this.application.generationHashes[this.application.activeNode];
      },
    },
  },
  mounted() {
    // activeWallet is not yet defined when opening the wallet from an URI
    if (!this.activeWallet) return;

    this.txRecipient = this.activeWallet.isWatchOnly
      ? this.activeWallet.publicAccount.address.pretty()
      : this.activeWallet.account.address.pretty();
  },
  methods: {
    createTransactionURI() {
      const nativeCurrency = NetworkCurrencyMosaic.createRelative(
        UInt64.fromUint(this.txAmount),
      );

      if (this.txAmount > 0) this.mosaics.unshift(nativeCurrency);
      const { generationHash } = this;
      const transaction = TransferTransaction.create(
        Deadline.create(),
        Address.createFromRawAddress(this.txRecipient),
        this.mosaics,
        PlainMessage.create(this.txMessage),
        NetworkType.MIJIN_TEST,
        UInt64.fromUint(0),
      );

      const serializedTransaction = transaction.serialize();

      const transactionURI = new TransactionURI(
        serializedTransaction,
        generationHash,
        this.endpoint,
      ).build();

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

      this.$store.dispatch('transactions/SAVE_CREATED_URI', {
        wallet: this.activeWallet,
        uriTransaction: {
          URI: transactionURI,
          transaction,
          txRecipient: this.txRecipient,
          formattedMosaics,
          txType: txTypeNameFromTypeId(transaction.type),
          generationHash,
          endpoint: this.endpoint,
        },
      });
      this.resetFields();
      this.dialog = false;
    },

    resetFields() {
      this.txMessage = '';
      this.txAmount = 0;
      this.checkbox = false;
      this.mosaics = [];
      this.currentMosaicName = '';
      this.currentMosaicAmount = '';
    },

    addMosaic() {
      const mosaicHex = this.currentMosaicName.toUpperCase();
      const mosaic = new Mosaic(
        new MosaicId(mosaicHex),
        UInt64.fromUint(this.currentMosaicAmount),
      );
      this.mosaics.push(mosaic);
    },

    removeMosaic(index) {
      this.mosaics.splice(index, 1);
    },
  },
};
</script>
