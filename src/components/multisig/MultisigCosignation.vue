<template>
  <v-layout
    column
    class="mt-2 mb-3"
  >
    <v-container>
      <v-layout
        row
        wrap
      >
        <v-flex
          v-if="multisig.loading_getMultisigInfo"
          xs12
        >
          <v-progress-linear
            :indeterminate="true"
          />
        </v-flex>
      </v-layout>

      <v-layout
              row
              wrap
      >
        <v-flex xs12>
          <v-radio-group
                  v-model="cosignType"
                  row
          >
            <template v-slot:label>
              <div>get cosign transactions by : </div>
            </template>
            <v-radio
                    v-for="l in cosignTypes"
                    :key="l.type"
                    :label="l.label"
                    :value="l.type"
            />
          </v-radio-group>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs12 v-if="cosignType == CosignTypes.MULTISIG_ACCOUNT" >
          <v-select
            v-model="currentMultisigPublicKey"
            label="Multisig Account Public Key"
            :items="multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts"
            item-text="publicKey"
          />
        </v-flex>
          <v-flex xs12 v-if="cosignType == CosignTypes.INPUT">
            <v-text-field
              v-model="currentInputPublicKey"
              class="ma-0 pa-0"
              label="Input Public Key"
              required
            />
        </v-flex>
      </v-layout>
      <div>
        <v-btn color="primary" @click="getCosignTransactions">get tranctions</v-btn>
      </div>
      <div v-if="aggregatedTx.length > 0">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div class="monospaced">
                <div class="clearfix homeLine">
                  <div
                    v-for="(item, num) in aggregatedTx"
                    :key="num"
                  >
                    <div class="clearfix">
                      transactionHash: <br> {{ item.transactionInfo.hash }}
                    </div>
                    <div>deadline:<br>{{ item.deadline.value }}</div>
                    <div>networkType:<br>{{ item.networkType }}</div>
                    <div>signature:<br>{{ item.signature }}</div>
                    <div>signer:<br>{{ item.signer.publicKey }}</div>
                    <div
                      v-for="(i,index) in item.innerTransactions"
                      :key="index"
                    >
                      inner Transactions {{ index + 1 }} :<br>
                      <div>inner Transactions Id:<br>{{ i.transactionInfo.id }}</div>
                      <div>
                        inner Transactions aggregateHash:
                        <br>
                        {{ i.transactionInfo.aggregateHash }}
                      </div>
                    </div>
                    <v-btn @click="cosignTransaction(num)">
                      cosign this transaction
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </div>

      <div v-else>
        <v-card v-show="isShowResult">
          <v-card-title primary-title>
            <div class="monospaced" >
              <div class="clearfix homeLine">
                no transactions waiting to be cosigned
              </div>
            </div>
          </v-card-title>
        </v-card>
      </div>
    </v-container>

    <Confirmation
            v-model="isDialogShow"
            :transactions="transactions"
            :isCosign = 'true'
            :generationHash="generationHash"
            @sent="txSent"
            @error="txError"
    >
    </Confirmation>
    <SendConfirmation
            :tx-send-data="txSendResults"
    />
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import {
  PublicAccount,
  AccountHttp,
  NetworkType,
} from 'nem2-sdk';
import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

const CosignTypes = {
  MULTISIG_ACCOUNT: 0,
  INPUT: 1,
};
export default {
  name: 'MultisigTransactions',
  components: {
    SendConfirmation,
    Confirmation,
  },
  computed: {
    ...mapState([
      'wallet',
      'accountInfo',
      'application',
      'assets',
      'namespaces',
      'multisig',
    ], {
      wallet: state => state.wallet,
      assets: state => state.assets,
      namespaces: state => state.namespaces,
    }),
    generationHash: {
      get() {
        return this.application.generationHashes[this.application.activeNode];
      },
    },
  },
  data() {
    return {
      txSendResults: [],
      transactions: [],
      isDialogShow: false,
      isShowResult: false,
      CosignTypes,
      currentInputPublicKey: '9C08CF57D9988C4F22DCA406B9A5AE8F877313076BAC0994FD6595D03BC1A093',
      currentMultisigPublicKey: '',
      activeWallet: this.$store.getters['wallet/GET_ACTIVE_WALLET'],
      aggregatedTx: [],
      publicKey: '',
      cosignType: CosignTypes.MULTISIG_ACCOUNT,
      cosignTypes: [
        {
          label: 'multisig accounts',
          type: CosignTypes.MULTISIG_ACCOUNT,
        }, {
          label: 'public key',
          type: CosignTypes.INPUT,
        },
      ],
    };
  },
  methods: {
    cosignTransaction(index) {
      this.isDialogShow = true;
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Generation Hash',
          value: this.generationHash,
        },
      ];
      this.transactions = [this.aggregatedTx[index]];
      this.getCosignTransactions();
    },
    async getCosignTransactions() {
      if (this.cosignType === CosignTypes.MULTISIG_ACCOUNT) {
        this.publicKey = this.currentMultisigPublicKey;
      } else {
        this.publicKey = this.currentInputPublicKey;
      }
      const accountHttp = new AccountHttp(this.application.activeNode);
      const publicAccount = PublicAccount.createFromPublicKey(
        this.publicKey, NetworkType.MIJIN_TEST,
      );
      this.aggregatedTx = await accountHttp.aggregateBondedTransactions(publicAccount).toPromise();
      // eslint-disable-next-line no-console
      console.log(this.aggregatedTx);
      this.isShowResult = true;
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
