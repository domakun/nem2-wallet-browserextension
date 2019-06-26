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
  <v-layout row>
    <v-flex
      v-if="transactions
        && transactions.length > 0"
      xs12
    >
      <v-card>
        <v-toolbar
          card
          prominent
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
        </v-toolbar>
        <template
          v-for="(uriTx, i) in transactions"
        >
          <v-list
            :key="i"
            class="pa-3"
            style="overflow: auto; height: auto !important;"
            height="auto"
            three-line
          >
            <div class="clearfix">
              <div
                style="
                  display: inline-block;
                  padding: 10px;"
              >
                <img
                  :src="qr(uriTx.transaction)"
                  style="width:200px"
                >
              </div>
              <div
                style="
                  display: inline-block;
                  max-width: 500px;
                  overflow: hidden;
                  vertical-align: top;
                  padding: 10px;"
              >
                <span class="clearfix">
                  Type: {{ uriTx.txType }}
                </span>

                <span class="clearfix">
                  To: {{ uriTx.txRecipient }}
                </span>

                <template v-for="(asset, j) in uriTx.formattedMosaics">
                  <v-list-tile-title :key="j">
                    <span class="clearfix">
                      {{ asset.mosaicName }} {{ asset.mosaicAmount.toLocaleString() }}
                    </span>
                  </v-list-tile-title>
                </template>

                <span
                  v-if="uriTx.transaction.message.payload !== ''"
                  class="clearfix"
                >
                  Message: {{ uriTx.transaction.message.payload }}
                </span>

                <span class="clearfix">
                  Generation Hash: {{ uriTx.generationHash }}
                </span>

                <span class="clearfix">
                  Endpoint: <a
                    :href="uriTx.endpoint"
                    target="_blank"
                  >{{ uriTx.endpoint }}</a>
                </span>

                <span class="clearfix">
                  Webhook: <a
                    :href="uriTx.webhook"
                    target="_blank"
                  >{{ uriTx.webhook }}</a>
                </span>

                <span
                  class="clearfix"
                  style="
                    overflow-wrap: break-word;
                    max-height: 82px;
                    overflow-y: scroll;"
                >
                  URI: <a :href="uriTx.URI">{{ uriTx.URI }}</a>
                </span>
              </div>
            </div>
          </v-list>
          <v-card-actions
            v-if="listType === 'uriToValidate'"
            :key="`actions-${i}`"
            class="pa-3"
          >
            <v-spacer />
            <v-btn
              flat
              :disabled="wallet.activeWallet.isWatchOnly"
              @click="toggleDialog = true"
            >
              Accept transaction
            </v-btn>
          </v-card-actions>
          <v-divider
            v-if="i + 1 < transactions"
            :key="`divider-${i}`"
          />
        </template>
      </v-card>
    </v-flex>
    <Confirmation
      v-model="toggleDialog"
      :v-if="listType === 'uriToValidate'"
      :transactions="transactions.map(({transaction})=>transaction)"
      :title="confirmationTitle"
      :body="body"
      :webhook="transactions[0].webhook"
      :max-width="600"
      :generation-hash="transactions[0].generationHash"
    >
      <template
        v-for="(uriTx, i) in transactions"
      >
        <v-list :key="i">
          <v-list-tile>
            <v-list-tile-action>
              <v-icon>person_outline</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Recipient: {{ uriTx.txRecipient }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile-tile v-if="uriTx.txMessage && uriTx.txMessage !== ''">
            <v-list-tile-action>
              <v-icon>message</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Message: {{ uriTx.txMessage }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile-tile>
        </v-list>
        <template v-for="(mosaic, j) in uriTx.transaction.mosaics">
          <v-list :key="i+'-'+j">
            <v-list-tile>
              <v-list-tile-action>
                <v-icon>group_work</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ mosaic.name || mosaic.id.toHex() }}:&nbsp;
                  {{ mosaic.amount.compact().toLocaleString() }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </template>
      </template>
    </Confirmation>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import { QRCodeGenerator } from 'nem2-qr-library';
import Confirmation from '../Confirmation.vue';

export default {
  components: {
    Confirmation,
  },
  props: {
    transactions: {
      type: Array,
      default() { return []; },
    },
    listType: {
      type: String,
      default() { return ''; },
    },
  },
  data() {
    return {
      toggleDialog: false,
      confirmationTitle: 'Are sure you want to accept this transaction?',
      body: 'This transaction came from a URI link, and is to be sent to an exernal service.  Please confirm all details once more before sending.',
    };
  },
  computed: {
    ...mapState(['wallet']),
    title() {
      return this.listType === 'uriToValidate'
        ? 'URI transactions to validate'
        : 'List of created URI invoices';
    },
  },
  methods: {
    qr(transaction) {
      return QRCodeGenerator.createTransactionRequest(transaction).toBase64();
    },
  },
};
</script>
