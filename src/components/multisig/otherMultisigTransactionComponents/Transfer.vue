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
                (Cow)
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
                    label="cat.currency amount(relative)"
                    placeholder="ex. 10"
                    type="number"
                  />

                  <v-text-field
                    v-model="txMaxFee"
                    label="Max fee"
                    placeholder="ex. 10"
                    type="number"
                  />

                  <v-text-field
                    v-model="generationHash"
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
                      v-if="mutisigAccount.mosaics.length > 0"
                      v-model="currentMosaicName"
                      :items="mutisigAccount.mosaics.map((mosaics)=> mosaics.id.toHex())"
                      label="Chose an asset"
                    />

                    <v-text-field
                      v-if="mutisigAccount.mosaics.length == 0"
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
                        <v-list-tile v-if="!(mosaic.id.toHex() == currentXEM.id.toHex())">
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

                  <v-flex
                    v-if="txRecipient == ''"
                    xs12
                  >
                    <v-alert
                      :value="true"
                      type="info"
                    >
                      A recipient address is required in order to send a transaction.
                    </v-alert>
                  </v-flex>
                </v-form>
              </v-flex>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :disabled="txRecipient == ''"
                  color="primary mx-0"
                  @click="sendTx"
                >
                  Send
                </v-btn>
              </v-card-actions>
              <div class="mt-4">
                <SendConfirmation
                  :tx-hash="txHash"
                  :tx-recipient="txRecipient"
                  :node-u-r-l="application.activeNode"
                />
              </div>

              <v-dialog
                v-model="dialog"
                max-width="500"
              >
                <v-card>
                  <v-card-title class="headline">
                    Send this transaction?
                  </v-card-title>
                  <v-card-text>
                    Are you sure you that you want to send a transaction with the following details?
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
                    <template v-for="(mosaic,index) in dialogMosaics">
                      <v-list :key="index">
                        <v-list-tile>
                          <v-list-tile-action>
                            <v-icon>group_work</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title>
                              Asset Attached: {{ mosaic.id.id.toHex() }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </template>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />

                    <v-btn
                      color="info"
                      @click="dialog = false"
                    >
                      Cancel
                    </v-btn>

                    <v-btn
                      color="info"
                      @click="transmitTransaction"
                    >
                      Yes, send it!
                    </v-btn>
                  </v-card-actions>
                </v-card>
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
  PublicAccount,
  UInt64,
  TransactionHttp,
  MosaicId,
  Mosaic,
  AccountHttp,
  NamespaceHttp,
  AggregateTransaction,
} from 'nem2-sdk';
import { mapState } from 'vuex';
import store from '../../../store/index';
import SendConfirmation from '../SendConfirmation.vue';

export default {
  components: {
    SendConfirmation,
  },
  props: ['currentMultisigPublicKey'],
  store,
  data() {
    return {
      txMessage: '',
      txAmount: 0,
      txMaxFee: 0,
      txRecipient: 'SAXJSNGSDPXHRK2N4PRB646HGZJT6GSJ4SJI3OEZ',
      userPrivateKey: '',
      signedTx: null,
      transferTx: null,
      dialog: false,
      checkbox: false,
      mosaics: [],
      currentMosaicName: '',
      currentMosaicAmount: '',
      txHash: '',
      mutisigAccount: {},
      multisigAccountInfo: {},
      currentXEM: {},
      mutisigPublicAccount: {},
      dialogMosaics: [],
      currentGenerationHash: '',
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
  watch: {
    async currentMultisigPublicKey() {
      const { activeNode } = this.application;
      const accountHttp = new AccountHttp(activeNode);
      const mutisigPublicAccount = PublicAccount
        .createFromPublicKey(this.currentMultisigPublicKey, NetworkType.MIJIN_TEST);
      this.mutisigPublicAccount = mutisigPublicAccount;
      const { address } = mutisigPublicAccount;
      const mutisigAccountInfo = await accountHttp.getMultisigAccountInfo(address).toPromise();
      this.multisigAccountInfo = mutisigAccountInfo;
      const mutisigAccount = await accountHttp.getAccountInfo(address, activeNode).toPromise();
      this.mutisigAccount = mutisigAccount;
    },
  },
  async created() {
    const namespaceHttp = new NamespaceHttp(this.application.activeNode);
    const currentXEM = await namespaceHttp
      .getLinkedMosaicId(NetworkCurrencyMosaic.NAMESPACE_ID).toPromise();
    this.currentXEM = currentXEM;
  },
  methods: {
    sendTx() {
      let mosaics = [];
      mosaics = this.mosaics.map(mosaic => mosaic);
      mosaics.push(new Mosaic(
        new MosaicId(this.currentXEM.id.toHex()), UInt64.fromUint(this.txAmount),
      ));
      this.dialogMosaics = mosaics;
      this.dialog = true;
    },
    transmitTransaction() {
      const transactionHttp = new TransactionHttp(this.application.activeNode);
      const innerTx = TransferTransaction.create(
        Deadline.create(),
        Address.createFromRawAddress(this.txRecipient),
        this.dialogMosaics,
        PlainMessage.create(this.txMessage),
        NetworkType.MIJIN_TEST,
      );

      if (this.multisigAccountInfo.minApproval <= 1) {
        // complete
        this.aggregeteCompleteTx(transactionHttp, innerTx);
      } else {
        // bonded
        this.aggregeteBondedTx(transactionHttp, innerTx);
      }
    },
    aggregeteCompleteTx(transactionHttp, innerTx) {
      const that = this;
      const completeTx = AggregateTransaction.createComplete(
        Deadline.create(),
        [innerTx.toAggregate(that.mutisigPublicAccount)],
        NetworkType.MIJIN_TEST,
        [],
      );
      const signedCompleteTx = this.wallet.activeWallet
        .account.sign(completeTx, this.generationHash);
      transactionHttp
        .announce(signedCompleteTx)
        // eslint-disable-next-line no-console
        .subscribe(x => console.log(x), err => console.error(err));
    },

    // eslint-disable-next-line no-unused-vars
    aggregeteBondedTx(transactionHttp, innerTx) {
      // eslint-disable-next-line no-console
      console.log('bonded tx');
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
      this.userPrivateKey = this.wallet.activeWallet.account.privateKey;
    },
  },
};

</script>
