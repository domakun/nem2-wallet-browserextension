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
        <v-flex xs12>
          <v-radio-group
            v-model="linkAction"
            row
          >
            <template v-slot:label>
              <div>Link action: </div>
            </template>
            <v-radio
              v-for="l in linkActions"
              :key="l.type"
              :label="l.label"
              :value="l.type"
            />
          </v-radio-group>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs12>
          <v-text-field
            v-model="remoteAccountKey"
            class="ma-0 pa-0"
            label="Remote Account Public Key"
            required
          />
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs12>
          <v-text-field
            v-model="maxFee"
            class="ma-0 pa-0"
            label="Max Fee"
            number
            required
          />
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs12>
          <v-text-field
            disabled
            v-model="generationHash"
            class="ma-0 pa-0"
            label="Generation Hash"
            string
            required
          />
        </v-flex>
      </v-layout>


        <v-btn
          style="margin-bottom: 20px"
          color="primary mx-0"
          :disabled="disabledSendTransaction"
          depressed
          @click="showDialog"
        >
          Send
        </v-btn>

      <v-layout column>
        <SendConfirmation
          :tx-send-data="txSendResults"
        />
      </v-layout>

      <Confirmation
        v-model="isDialogShow"
        :transactions="transactions"
        :generation-hash="generationHash"
        @sent="txSent"
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
    </v-container>
  </v-layout>
</template>
<script>
import {
  LinkAction,
  AccountLinkTransaction,
  Deadline,
  NetworkType,
  UInt64,
} from 'nem2-sdk';
import { mapState } from 'vuex';
import SendConfirmation from '../signature/SendConfirmation.vue';
import Confirmation from '../signature/Confirmation.vue';

export default {
  components: {
    Confirmation,
    SendConfirmation,
  },
  data() {
    return {
      maxFee: 0,
      remoteAccountKey: 'F95DE849EA383A05F128DA22FD3801D83B1327A86959BB9EC53DBBEDE3AEE488',
      linkAction: LinkAction.Link,
      linkActions: [
        {
          label: 'Link',
          type: LinkAction.Link,
        }, {
          label: 'Unlink',
          type: LinkAction.Unlink,
        },
      ],
      isDialogShow: false,
      dialogDetails: [],
      transactions: [],
      txSendResults: [],
      currentGenerationHash: '',
    };
  },
  computed: {
    ...mapState([
      'application',
    ]),
    disabledSendTransaction() {
      return this.linkAction === -1 || this.remoteAccountKey === '';
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
    showDialog() {
      const { linkAction, remoteAccountKey } = this;
      this.transactions = [new AccountLinkTransaction(
        NetworkType.MIJIN_TEST,
        2,
        Deadline.create(),
        UInt64.fromUint(this.maxFee),
        remoteAccountKey,
        linkAction,
      )];
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Link Action',
          value: this.linkAction === 1 ? 'Unlink' : 'Link',
        },
        {
          icon: 'add',
          key: 'Account Public Key',
          value: this.remoteAccountKey,
        },
        {
          icon: 'add',
          key: 'Max Fee',
          value: this.maxFee,
        },
      ];
      this.isDialogShow = true;
    },
    txSent(result) {
      this.txSendResults.push({
        txHash: result.txHash,
        nodeURL: result.nodeURL,
      });
    },
  },
};
</script>
<style scoped>
</style>
