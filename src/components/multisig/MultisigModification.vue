<template>
  <v-layout
          column
          class="mt-2 mb-3"
  >
    <v-container v-show="!multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts">
      this account does not own any multisig to modify
    </v-container>
    <v-container v-show="multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts">
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
              v-if="!multisig.loading_getMultisigInfo
          && multisig.multisigInfo[wallet.activeWallet.name]"
              row
      >
        <v-flex xs12>
          <v-select
                  v-model="currentMultisigPublicKey"
                  label="Multisig Account Publickey"
                  :items="multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts"
                  item-text="publicKey"
                  solo
          />
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex xs12>
          <v-text-field
                  v-model="approvalDelta"
                  label="Approval Delta"
                  type="number"
                  required
                  number
                  class="ma-0 pa-0"
          />
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex xs12>
          <v-text-field
                  v-model="removalDelta"
                  label="Removal Delta"
                  type="number"
                  required
                  number
                  class="ma-0 pa-0"
          />
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex xs12>
          <v-text-field
                  v-model="maxFee"
                  class="ma-0 pa-0"
                  label="Max Fee"
                  type="number"
                  required
                  number
          />
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex xs12>
          <v-text-field
                  v-model="generationHash"
                  class="ma-0 pa-0"
                  label="Generation Hash"
                  required
          />
        </v-flex>
      </v-layout>

<!--      <v-layout-->
<!--              v-if="showLockFunds"-->
<!--              row-->
<!--      >-->
<!--        <v-flex xs12>-->
<!--          <v-subheader>Lock Funds Transacion</v-subheader>-->
<!--        </v-flex>-->
<!--      </v-layout>-->
<!--      <v-layout-->
<!--              v-if="showLockFunds"-->
<!--              row-->
<!--      >-->
<!--        <v-flex xs6>-->
<!--          <v-text-field-->
<!--                  v-model="lockFundsMosaicType"-->
<!--                  class="ma-0 pa-0"-->
<!--                  required-->
<!--                  disabled-->
<!--          />-->
<!--        </v-flex>-->
<!--        <v-flex xs6>-->
<!--          <v-text-field-->
<!--                  v-model="lockFundsMosaicAmount"-->
<!--                  class="ma-0 pa-0"-->
<!--                  type="number"-->
<!--                  required-->
<!--                  disabled-->
<!--                  number-->
<!--          />-->
<!--        </v-flex>-->
<!--      </v-layout>-->
<!--      <v-layout v-if="showLockFunds">-->
<!--        <v-flex xs12>-->
<!--          <v-text-field-->
<!--                  v-model="lockFundsDuration"-->
<!--                  label="Lock Funds Duration In Blocks"-->
<!--                  class="ma-0 pa-0"-->
<!--                  type="number"-->
<!--                  required-->
<!--                  number-->
<!--          />-->
<!--        </v-flex>-->
<!--      </v-layout>-->
<!--      <v-layout v-if="showLockFunds">-->
<!--        <v-flex xs12>-->
<!--          <v-text-field-->
<!--                  v-model="lockFundsMaxFee"-->
<!--                  label="Lock Funds Max Fee"-->
<!--                  class="ma-0 pa-0"-->
<!--                  type="number"-->
<!--                  required-->
<!--                  number-->
<!--          />-->
<!--        </v-flex>-->
<!--      </v-layout>-->

      <v-layout>
        <v-flex sm>
          <v-layout row>
            <v-flex offset-xs1>
              <v-btn
                      dark
                      :color="isRemove ?'red':'primary' "
                      @click="isRemove = !isRemove"
              >
                {{ isRemove?'Remove':'Add'}}
                <v-icon
                        dark
                        right
                >
                  {{ isRemove ?'remove_circle_outline':'add_circle_outline' }}
                </v-icon>
              </v-btn>
            </v-flex>
            <v-flex xs6>
              <v-text-field
                      v-model="currentCosignatoryPublicKey"
                      placeholder="input cosignatory publickey"
                      solo
              />
            </v-flex>
            <v-flex xs3>
              <v-btn
                      :disabled="currentCosignatoryPublicKey === ''"
                      color="primary"
                      @click="addCosignatory"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <template v-for="(cosignatory, index) in cosignatoryList">
            <v-list
                    :key="index"
                    two-line
            >
              <v-list-tile>
                <v-list-tile-action>
                  <v-icon>style</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-subheader>
                    {{ cosignatory.modificationType == 0 ? 'add':'remove' }}
                  </v-subheader>
                  cosignatory publickey:
                  {{ cosignatory.cosignatoryPublicKey }}
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
                row
                justify-center
                align-center
        >
          <v-btn
                  :disabled="disabledSendLockFundsTransaction"
                  @click="showDialog">
            send
          </v-btn>
        </v-layout>

        <Confirmation
                v-model="isDialogShow"
                :transactions="transactions"
                :transactionType="transactionType"
                :generationHash="generationHash"
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

            <v-list-tile>
              cosignatory list：
            </v-list-tile>
            <v-list-tile
                    v-for="(cosignatory,index) in cosignatoryList"
                    :key="index"
            >
              <v-list-tile-action>
                <v-icon>add</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ cosignatory.modificationType == 0 ? 'add': 'remove' }}:
                  {{ cosignatory.cosignatoryPublicKey }}
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
        <v-dialog
                v-model="isShowErrorMessage"
                width="500"
        >
        <ErrorMessage
            :errorMessage = 'errorMessage'
            @hideErrorMessage = 'hideErrorMessage'
        />
        </v-dialog>
      </v-layout>
    </v-container>
  </v-layout>
</template>

<script>

import { mapState } from 'vuex';
import {
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModificationType,
  NetworkType,
  Deadline,
  PublicAccount,
  AggregateTransaction,
  TransactionType,
  MultisigCosignatoryModification,
  AccountHttp,
  Address, HashLockTransaction,
  NetworkCurrencyMosaic,
  UInt64,
} from 'nem2-sdk';
import { multisigModifyValidator } from '../../infrastructure/multisig/multisigFormValidator';
import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';
import ErrorMessage from '../errorMessage/ErrorMessage.vue';

export default {
  name: 'ModifyMultisig',
  components: {
    Confirmation,
    SendConfirmation,
    ErrorMessage,
  },
  data() {
    return {
      isShowErrorMessage:false,
      errorMessage: [],
      transactionType: -1,
      showLockFunds: true,
      currentMultisigPublicKey: '',
      currentMultisigAccount: '',
      removalDelta: 0,
      approvalDelta: 0,
      isRemove: false,
      currentCosignatoryPublicKey: '5FA48DA997E605323BCD579ABD6FC996B18DF3289A488A12E3C9CE27C10AAC41',
      cosignatoryList: [],
      cosignatoryAddList: [],
      cosignatoryDeleteList: [],
      maxFee: 0,
      lockFundsMosaicType: '@cat.currency',
      lockFundsMosaicAmount: 10000000,
      lockFundsDuration: 480,
      lockFundsMaxFee: 0,
      isDialogShow: false,
      transactions: [],
      dialogDetails: [],
      disabledSendLockFundsTransaction: false,
      disabledSendAggregateTransaction: true,
      txSendResults: [],
      activeWallet: this.$store.getters['wallet/GET_ACTIVE_WALLET'],
      aggregateTx: {},
      currentGenerationHash: '',
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'multisig',
      'application',
    ], {
      wallet: state => state.wallet,
    }),
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
      const accountHttp = new AccountHttp(this.application.activeNode);
      this.currentMultisigAccount = await accountHttp
        .getMultisigAccountInfo(Address.createFromPublicKey(
          this.currentMultisigPublicKey, NetworkType.MIJIN_TEST,
        )).toPromise();
      if (this.currentMultisigAccount.minApproval > 1) {
        this.showLockFunds = true;
      } else {
        this.showLockFunds = false;
      }
    },
  },
  methods: {
    addCosignatory() {
      const { isRemove, currentCosignatoryPublicKey } = this;
      const cosignerItem = {
        cosignatoryPublicKey: currentCosignatoryPublicKey,
        modificationType: isRemove ? MultisigCosignatoryModificationType.Remove : MultisigCosignatoryModificationType.Add,
      }
      if (isRemove) {
        this.cosignatoryDeleteList.push(cosignerItem);
      } else {
        this.cosignatoryAddList.push(cosignerItem);
      }
      this.cosignatoryList.push(cosignerItem);
      this.currentCosignatoryPublicKey = '';
    },
    removeCosignatory(index) {
      this.cosignatoryList.splice(index, 1);
    },
    checkForm() {
      this.errorMessage = multisigModifyValidator(this)
      if (this.errorMessage.length > 0) {
        this.isShowErrorMessage = true;
        return false;
      }
      return true;
    },
    showDialog() {
      if (!this.checkForm()) {
        return;
      }
      this.isDialogShow = true;
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Removal Delta',
          value: this.removalDelta,
        },
        {
          icon: 'add',
          key: 'Approval Delta',
          value: this.approvalDelta,
        },
        {
          icon: 'add',
          key: 'Max Fee',
          value: this.maxFee,
        },
        {
          icon: 'add',
          key: 'Generation Hash',
          value: this.generationHash,
        },
      ];
      if (this.currentMultisigAccount.minApproval > 1) {
        this.transactionType = TransactionType.AGGREGATE_BONDED;
        this.createBondedModifyTransaction();
      } else if (this.cosignatoryList.length > 0) {
        this.transactionType = TransactionType.AGGREGATE_BONDED;
        this.createBondedModifyTransaction();
      } else {
        this.transactionType = TransactionType.AGGREGATE_COMPLETE;
        this.createComplete();
      }
    },
    createComplete() {
      const network = NetworkType.MIJIN_TEST;
      const minApprovalDelta = this.approvalDelta;
      const minRemovalDelta = this.removalDelta;
      const multisigPublicAccount = PublicAccount.createFromPublicKey(
        this.currentMultisigPublicKey, network,
      );
      const modifyMultisigAccountTx = ModifyMultisigAccountTransaction.create(
        Deadline.create(),
        Number(minApprovalDelta),
        Number(minRemovalDelta),
        [],
        network,
      );
      const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(),
        [modifyMultisigAccountTx.toAggregate(multisigPublicAccount)],
        network,
        [],
      );
      this.transactions = [aggregateTransaction];
    },
    async createBondedModifyTransaction() {
      const { account } = this.wallet.activeWallet;
      const multisigPublicAccount = PublicAccount
        .createFromPublicKey(this.currentMultisigPublicKey, NetworkType.MIJIN_TEST);
      const network = NetworkType.MIJIN_TEST;
      const minApprovalDelta = this.approvalDelta;
      const minRemovalDelta = this.removalDelta;
      const cosignatories = this.cosignatoryList;

      const modifyMultisigAccountTx = ModifyMultisigAccountTransaction.create(
        Deadline.create(),
        Number(minApprovalDelta),
        Number(minRemovalDelta),
        cosignatories.map(co => new MultisigCosignatoryModification(
          co.modificationType
            ? MultisigCosignatoryModificationType.Remove : MultisigCosignatoryModificationType.Add,
          PublicAccount.createFromPublicKey(co.cosignatoryPublicKey, network),
        )),
        network,
      );

      const aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(),
        [
          modifyMultisigAccountTx.toAggregate(multisigPublicAccount),
        ],
        network,
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
    hideErrorMessage() {
      this.isShowErrorMessage = false;
    },
  },
};
</script>
