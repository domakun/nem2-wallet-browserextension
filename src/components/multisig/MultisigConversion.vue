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
          column
          class="mt-2 mb-3" >
    <v-container>
      <v-layout
              row
              wrap >
        <v-flex
                v-if="multisig.loading_getMultisigInfo"
                xs12 >
          <v-progress-linear
                  :indeterminate="true" />
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs12>
          <v-text-field
                  v-model="minApprovalDelta"
                  error-count="1"
                  label="Min approval"
                  type="number"
                  required
                  number />
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex xs12>
          <v-text-field
                  v-model="minRemovalDelta"
                  class="ma-0 pa-0"
                  label="Min removal"
                  type="number"
                  required
                  number />
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs12>
          <v-text-field
                  v-model="maxFee"
                  label="Max Fee" />
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs2>
          <v-subheader>generation hash</v-subheader>
        </v-flex>
        <v-flex xs9>
          <v-text-field
                  class="ma-0 pa-0"
                  v-model="generationHash"
                  label="generation hash in this point"
                  disabled
                  requiredv
                  solo />
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex  sm >
          <v-layout row>
            <v-flex xs2>
              <v-subheader>cosigner's publickey</v-subheader>
            </v-flex>
            <v-flex xs8>
              <v-text-field
                      v-model="currentPublicKey"
                      label="New consignatory's public key"
                      solo />
            </v-flex>
            <v-flex xs2>
              <v-btn
                      :disabled="currentPublicKey == ''"
                      color="primary"
                      @click="addPublicKey" >
                <v-icon>add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>

          <template v-for="(publicKey, index) in publicKeyList">
            <v-list
                    :key="index"
                    two-line
            >
              <v-list-tile>
                <v-list-tile-action>
                  <v-icon>style</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  Cosignatory Publickey:{{ index + 1 }}
                  <br>
                  {{ publicKey }}
                </v-list-tile-content>
                <v-btn
                        fab
                        small
                        color="error"
                        @click="removeCosignatory(index)"
                >
                  <v-icon>remove</v-icon>
                </v-btn>
              </v-list-tile>
            </v-list>
          </template>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-layout
                v-if="wallet.activeWallet.name"
                row
                justify-space-around
                align-center
        >
          <v-btn
                  :disabled="!(typeof multisig
              .multisigInfo[wallet.activeWallet.name].account === 'undefined'
              || !multisig.multisigInfo[wallet.activeWallet.name].isMultisig())"
                  @click="showDialog"
          >
            Send
          </v-btn>
        </v-layout>

        <Confirmation
                v-model="isDialogShow"
                :transactions="transactions"
                :generationHash="generationHash"
                :transactionType = 'TransactionType.AGGREGATE_BONDED'
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

            <v-list-tile
                    v-for="(publicKey,index) in publicKeyList"
                    :key="index"
            >
              <v-list-tile-action>
                <v-icon/>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ publicKey }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </Confirmation>
      </v-layout>
      <v-layout column>
        <SendConfirmation
                :tx-send-data="txSendResults"
        />
      </v-layout>
    </v-container>
    <v-dialog
            v-model="isShowErrorMessage"
            width="500"
    >
      <v-card>
        <v-card-title
                class="headline grey lighten-2"
                primary-title
        >
          Lack of necessary information
        </v-card-title>

        <v-card-text>
          <div :key="index" v-for="(e,index) in errorMessage">
            {{e}}
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
                  color="primary"
                  flat
                  @click="isShowErrorMessage = false"
          >
            i see
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>

import {
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  NetworkType,
  Deadline,
  PublicAccount,
  TransactionType,
  AggregateTransaction,
  HashLockTransaction,
  NetworkCurrencyMosaic,
  UInt64,
} from 'nem2-sdk';
import { mapState } from 'vuex';
import ErrorMessage from '../../infrastructure/transactions/errorMessage';
import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

export default {
  name: 'AssetCreation',
  components: {
    Confirmation,
    SendConfirmation,
  },
  data() {
    return {
      TransactionType,
      currentPublicKey: '8286C52C585471A6BEAAFE07C68EA004CF2DF5EE171A88596B26054FEAF4C8BC',
      publicKeyList: [],
      isDialogShow: false,
      txSendResults: [],
      dialogDetails: [],
      transactions: [],
      minApprovalDelta: 1,
      minRemovalDelta: 1,
      maxFee: 0,
      currentGenerationHash: '',
      errorMessage: [],
      isShowErrorMessage: false,
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
      'assets',
      'multisig',
    ]),
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
    addPublicKey() {
      if (this.publicKeyList.length <= 10) {
        this.publicKeyList.push(this.currentPublicKey);
        this.currentPublicKey = '';
      } else {
        // eslint-disable-next-line no-console
        this.errorMessage.push(ErrorMessage.TOO_MUCH_COSIGNER);
      }
    },
    checkForm() {
      const that = this;
      this.errorMessage = [];
      if (this.minApprovalDelta < 0) {
        this.errorMessage.push(ErrorMessage.MIN_APPROVAL_ERROR);
        return false;
      }
      if (this.minRemovalDelta < 0) {
        this.errorMessage.push(ErrorMessage.MIN_REMOVAL_ERROR);
        return false;
      }
      if (this.txMaxFee < 0) {
        this.errorMessage.push(ErrorMessage.MAX_FEE_ERROR);
        return false;
      }
      if (!this.generationHash || this.generationHash.trim() === '') {
        this.errorMessage.push(ErrorMessage.GENERATION_HASH_NULL);
        return false;
      } else if (this.generationHash.length !== 64) {
        this.errorMessage.push(ErrorMessage.GENERATION_HASH_ERROR);
        return false;
      }
      if (this.publicKeyList.length === 0) {
        this.errorMessage.push(ErrorMessage.NO_COSIGNER);
        return false;
      }
      return this.publicKeyList.every((item) => {
        if (item.trim().length !== 64) {
          that.errorMessage.push(ErrorMessage.PUBLIC_KEY_ERROR);
          return false;
        }
        return true;
      });
    },
    showDialog() {
      if (!this.checkForm()) {
        this.isShowErrorMessage = true;
        return;
      }
      const { account } = this.wallet.activeWallet;
      const { minApprovalDelta, minRemovalDelta, publicKeyList } = this;
      const networkType = NetworkType.MIJIN_TEST;
      const modifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
        Deadline.create(),
        minApprovalDelta,
        minRemovalDelta,
        publicKeyList.map(cosigner => new MultisigCosignatoryModification(
          MultisigCosignatoryModificationType.Add,
          PublicAccount.createFromPublicKey(cosigner, networkType),
        )),
        networkType,
      );
      const aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(),
        [modifyMultisigAccountTransaction.toAggregate(account.publicAccount)],
        NetworkType.MIJIN_TEST,
      );

      const signedTransaction = account.sign(aggregateTransaction, this.generationHash);
      const hashLockTransaction = HashLockTransaction.create(
        Deadline.create(),
        NetworkCurrencyMosaic.createRelative(10),
        UInt64.fromUint(480),
        signedTransaction,
        NetworkType.MIJIN_TEST,
      );
      this.transactions = [hashLockTransaction, aggregateTransaction];
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Min Approval',
          value: this.minApprovalDelta,
        },
        {
          icon: 'add',
          key: 'Min Removal',
          value: this.minRemovalDelta,
        },
        {
          icon: 'add',
          key: 'Max Fee',
          value: this.maxFee,
        },
        {
          icon: 'add',
          key: 'Cosignatory List',
          value: '',
        },
      ];
      this.isDialogShow = true;
    },
    removeCosignatory(index) {
      this.publicKeyList.splice(index, 1);
    },
    txSent(result) {
      this.isDialogShow = false;
      this.txSendResults.push({
        txHash: result.txHash,
        nodeURL: result.nodeURL,
      });
    },
    txError(error) {
      this.isDialogShow = false;
      // eslint-disable-next-line no-console
      console.error(error);
    },
  },
};
</script>
