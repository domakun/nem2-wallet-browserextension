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
      <v-layout
        row
        wrap
      >
        <v-flex xs12>
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
              <v-toolbar-title>Transfer Transaction</v-toolbar-title>

              <v-spacer />
              <v-btn
                href="https://nemtech.github.io/concepts/transfer-transaction.html"
                target="_new"
                icon
              >
                <v-icon>local_library</v-icon>
              </v-btn>
            </v-toolbar>


            <v-card-text>
              <p class="mb-4 mt-4">
                Current Node:
                <a
                  :href="application.activeNode"
                  target="_new"
                >{{ application.activeNode }}</a>
                (Dragon)
              </p>
              <v-flex xs12>
                <v-form lazy-validation>
                  <v-text-field
                    v-model="txRecipient"
                    label="Recipient's address"
                    placeholder="ex. SB2JNF-UZ4MQP-BBDEQ2-C4QW2U-56PPVK-KMAMDU-77IE"
                    required
                  />

                  <v-text-field
                    v-model="txAmount"
                    label="cat.currency amount"
                    placeholder="ex. 10"
                    type="number"
                  />

                  <v-text-field
                    v-model="txMaxFee"
                    label="Max fee"
                    placeholder="ex. 10"
                    type="number"
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
                    <v-combobox
                      v-if="wallet.activeWallet && assets.assets[wallet.activeWallet.name].length>0"
                      v-model="currentMosaicName"
                      :items="assets.assets[wallet.activeWallet.name].map(({id})=>id)"
                      label="Chose an asset"
                    />

                    <v-text-field
                      v-if="!wallet.activeWallet
                        || assets.assets[wallet.activeWallet.name].length===0"
                      v-model="currentMosaicName"
                      label="Enter a mosaic ID"
                    />

                    <v-layout row>
                      <v-flex xs-11>
                        <v-text-field
                          v-model="currentMosaicAmount"
                          label="Asset Amount"
                          placeholder="ex. 10"
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
                    placeholder="Here is your XEM, Bob! - Alice"
                  />

                  <v-text-field
                    v-model="generationHash"
                    label="Network generation hash"
                    class="mt-3 mb-3"
                    required
                    disabled
                  />

                  <v-text-field
                    v-model="userPrivateKey"
                    label="Private Key"
                    class="mt-3 mb-3"
                    :counter="64"
                    required
                  >
                    <template slot="append">
                      <v-spacer />
                      <v-btn
                        v-if="userPrivateKey == ''"
                        small
                        color="primary"
                        @click="fillPrivateKeyField"
                      >
                        Use my wallet's private key
                      </v-btn>
                    </template>
                  </v-text-field>
                  <PasswordInput
                    :visible="showPasswordInput"
                    :wallet-name="wallet.activeWallet.name"
                    :wallet-type="wallet.activeWallet.walletType"
                    @close="fillPrivateKeyField"
                  />
                  <v-flex
                    v-if="txRecipient == '' || userPrivateKey == ''"
                    xs12
                  >
                    <v-alert
                      :value="true"
                      type="info"
                    >
                      A private key, recipient address, and amount&nbsp;
                      are required in order to send a transaction.
                    </v-alert>
                  </v-flex>
                </v-form>
              </v-flex>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :disabled="txRecipient === '' || userPrivateKey === ''
                    || generationHash === ''"
                  color="primary mx-0"
                  @click="createTransferTransaction"
                >
                  Send
                </v-btn>
              </v-card-actions>
              <div class="mt-4">
                <SendConfirmation
                  :tx-hash="txHash"
                  :tx-recipient="txRecipient"
                  :node-u-r-l="application.activeNode"
                  :tx-send-data="txSendResults"
                  :generation-hash="generationHash"
                />
              </div>


              <Confirmation
                      v-model="isDialogShow"
                      :transactions="transactions"
                      :generation-hash="generationHash"
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

              <v-dialog
                v-model="isShowErrorMessage"
                width="500"
              >
                <ErrorMessage
                        :errorMessage = 'errorMessage'
                        @hideErrorMessage = 'hideErrorMessage'
                />
              </v-dialog>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-layout>
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
import { mapState } from 'vuex';
import { transferValidator } from '../../infrastructure/transactions/transactionFormValidator';
import ErrorMessage from '../errorMessage/ErrorMessage.vue';
import store from '../../store/index';
import SendConfirmation from '../signature/SendConfirmation.vue';
import Confirmation from '../signature/Confirmation.vue';
import PasswordInput from '../wallet/PasswordInput.vue';

export default {
  components: {
    SendConfirmation,
    PasswordInput,
    ErrorMessage,
    Confirmation,
  },
  store,
  // eslint-disable-next-line vue/require-prop-types
  props: ['transactionType'],
  data() {
    return {
      transactions: [],
      txSendResults: [],
      txMessage: '',
      txAmount: 0,
      txMaxFee: 0,
      txRecipient: 'SBIWHD-WZMPIX-XM2BIN-CRXAK3-H3MGA5-VHB3D2-PO5W',
      userPrivateKey: '',
      signedTx: null,
      isDialogShow: false,
      dialogDetails: [],
      checkbox: false,
      mosaics: [],
      currentMosaicName: '',
      currentMosaicAmount: '',
      currentGenerationHash: '',
      txHash: '',
      errorMessage: [],
      isShowErrorMessage: false,
      showPasswordInput: false,
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
      'assets',
    ]),
    transactionHttp() {
      return new TransactionHttp(this.application.activeNode);
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
  methods: {
    createTransferTransaction() {
      this.errorMessage = transferValidator(this);
      if (this.errorMessage.length !== 0) {
        this.isShowErrorMessage = true;
        return;
      }
      const { mosaics } = this;
      const mosaicHexList = mosaics.map(item => item.id.toHex());
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Recipient',
          value: this.txRecipient,
        },
        {
          icon: 'add',
          key: 'Amount',
          value: this.txAmount,
        },
        {
          icon: 'add',
          key: 'Message ',
          value: this.txMessage,
        },
        {
          icon: 'add',
          key: ' Asset Attached',
          value: mosaicHexList.join(' , '),
        },
      ];
      this.isDialogShow = true;
      const recipientAddr = Address.createFromRawAddress(this.txRecipient);
      const nativeCurrency = NetworkCurrencyMosaic.createRelative(
        UInt64.fromUint(this.txAmount),
      );

      if (this.txAmount > 0 || this.mosaics.length === 0) {
        this.mosaics.unshift(nativeCurrency);
      }

      const transferTransaction = TransferTransaction.create(
        Deadline.create(),
        recipientAddr,
        this.mosaics,
        PlainMessage.create(this.txMessage),
        NetworkType.MIJIN_TEST,
        UInt64.fromUint(this.txMaxFee),
      );
      this.transactions = [transferTransaction];
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

    fillPrivateKeyField() {
      if (!this.wallet.activeWallet.account) {
        this.showPasswordInput = true;
      } else {
        this.showPasswordInput = false;
        this.userPrivateKey = this.wallet.activeWallet.account.privateKey;
      }
    },
    hideErrorMessage() {
      this.isShowErrorMessage = false;
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
