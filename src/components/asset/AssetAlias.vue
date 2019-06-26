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
  <v-dialog
    v-model="show"
    max-width="680px"
  >
    <v-card>
      <v-toolbar card>
        <v-card-title primary-title>
          <h3 class="headline mb-3">
            {{
              activeAsset.name
                ? `Remove the alias ${activeAsset.name} from the asset ${activeAsset.id}`
                : `Add an alias to the asset: ${activeAsset.id}`
            }}
          </h3>
        </v-card-title>
      </v-toolbar>
      <v-card-text>
        <div
          v-if="namespaces.namespaces[wallet.activeWallet.name]
            && namespaces.namespaces[wallet.activeWallet.name].length === 0"
        >
          This wallet has no namespace.
          A namespace is required to add a namespace to an asset.
        </div>
        <div
          v-if="namespaces.namespaces[wallet.activeWallet.name]
            && namespaces.namespaces[wallet.activeWallet.name].length > 0"
        >
          <v-radio-group
            v-model="aliasActionType"
            row
          >
            <template v-slot:label>
              <div>Link action: </div>
            </template>
            <v-radio
              v-for="l in aliasActionTypes"
              :key="l.type"
              :label="l.label"
              :value="l.type"
              disabled
            />
          </v-radio-group>
          <v-select
            v-model="namespace"
            :items="namespaces.namespaces[wallet.activeWallet.name]
              .map(({ name, hexId })=>({
                display: `${name} - ${hexId}`,
                name,
              }))"
            item-text="display"
            item-value="name"
            label="Namespace"
            :disabled="activeAsset.name ? true : false"
            required
          />

          <SendConfirmation
            :tx-send-data="txSendResults"
          />
          <v-card-actions>
            <v-spacer />
            <v-btn
              flat
              @click="$emit('close')"
            >
              close
            </v-btn>
            <v-btn
              :disabled="namespace === '' && !currentNamespace"
              color="primary mx-0"
              @click="showDialog"
            >
              Send Transaction
            </v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
    </v-card>

    <Confirmation
      v-model="isDialogShow"
      :transactions="transactions"
      :generation-hash="application.generationHashes[application.activeNode]"
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
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import {
  Deadline,
  MosaicId,
  NetworkType,
  MosaicAliasTransaction,
  AliasActionType,
  NamespaceId,
} from 'nem2-sdk';

import Confirmation from '../signature/Confirmation.vue';
import SendConfirmation from '../signature/SendConfirmation.vue';

export default {
  name: 'AssetAlias',
  components: {
    Confirmation,
    SendConfirmation,
  },
  props: {
    visible: Boolean,
    activeAsset: {
      type: Object,
      default() {
        return { id: false, name: false };
      },
    },
  },
  data() {
    return {
      dialogDetails: [],
      txSendResults: [],
      transactions: [],
      disabledSendTransaction: false,
      isDialogShow: false,
      currentNamespace: false,
      aliasActionTypes: [
        {
          label: 'Link',
          type: AliasActionType.Link,
        }, {
          label: 'Unlink',
          type: AliasActionType.Unlink,
        },
      ],
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
      'namespaces',
    ]),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      },
    },
    aliasActionType: {
      get() {
        return this.activeAsset.name ? 1 : 0;
      },
    },
    namespace: {
      get() {
        return this.activeAsset.name ? this.activeAsset.name : '';
      },
      set(e) {
        this.currentNamespace = e;
        return false;
      },
    },
  },
  methods: {
    showDialog() {
      this.aliasTransaction();
      this.dialogDetails = [
        {
          icon: 'add',
          key: 'Mosaic',
          value: this.activeAsset.name
            ? `${this.activeAsset.name} (${this.activeAsset.id})`
            : this.activeAsset.id,
        },
        {
          icon: 'add',
          key: 'Link Action',
          value: this.aliasActionType === 1 ? 'Unlink' : 'Link',
        },
        {
          icon: 'add',
          key: 'Namespace',
          value: `${this.namespace}`,
        },
      ];
      this.isDialogShow = true;
    },

    aliasTransaction() {
      const namespace = this.currentNamespace || this.namespace;
      this.transactions = [
        MosaicAliasTransaction.create(
          Deadline.create(),
          this.aliasActionType,
          new NamespaceId(namespace),
          new MosaicId(this.activeAsset.id),
          NetworkType.MIJIN_TEST,
        ),
      ];
    },
    dialogClosed() {
      this.isDialogShow = false;
      this.dialogDetails = [];
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
