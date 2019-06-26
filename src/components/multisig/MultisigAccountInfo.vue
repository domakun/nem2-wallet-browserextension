<template>
<!--
                   v-if="multisig.multisigInfo && multisig.multisigInfo[wallet.activeWallet.name]"
                  :multisig-account-info="multisig.multisigInfo[wallet.activeWallet.name]"
                  -->
  <div>
    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <v-card>
          <v-toolbar
            card
            prominent
          >
            <v-toolbar-title>{{ wallet.activeWallet.name }}: Multisig Information</v-toolbar-title>
            <v-spacer />

            <v-btn
              icon
              @click.stop="reloadMultisigInfo(wallet.activeWallet)"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
          </v-toolbar>
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
          <v-card-title
            v-if="!multisig.loading_getMultisigInfo
            && !multisig.multisigInfo[wallet.activeWallet.name]"
            primary-title
          >
            <div class="monospaced">
              <div class="clearfix homeLine">
                This account is not a multisig nor a cosignatory one
              </div>
            </div>
          </v-card-title>
          <v-card-title
            v-if="!multisig.loading_getMultisigInfo
            && multisig.multisigInfo[wallet.activeWallet.name]"
            primary-title
          >
            <div class="monospaced">
              <div class="clearfix homeLine">
                <div class="clearfix">
                  account public key:
                </div>
                <div class="clearfix">
                  {{ typeof multisig.multisigInfo[wallet.activeWallet.name].account == 'undefined'
                    ?'':multisig.multisigInfo[wallet.activeWallet.name].account.publicKey }}
                </div>
              </div>

              <div class="clearfix homeLine">
                <div class="clearfix">
                  min approval:
                </div>
                <div class="clearfix">
                  {{ multisig.multisigInfo[wallet.activeWallet.name].minApproval }}
                </div>
              </div>

              <div class="clearfix homeLine">
                <div class="clearfix">
                  min removal:
                </div>
                <div class="clearfix">
                  {{ multisig.multisigInfo[wallet.activeWallet.name].minRemoval }}
                </div>
              </div>

              <div
                v-if="!multisig.loading_getMultisigInfo
                 && !multisig.multisigInfo[wallet.activeWallet.name]"
               class="clearfix homeLine"
              >
                <div class="clearfix">
                  cosignatory list:
                </div>
                <div
                  v-for="(m, j) in multisig.multisigInfo[wallet.activeWallet.name].cosignatories"
                  :key="j"
                  class="clearfix"
                >
                  {{ m.publicKey }}
                </div>
              </div>
              <div
               v-if="!multisig.loading_getMultisigInfo
                && multisig.multisigInfo[wallet.activeWallet.name]"
              class="clearfix homeLine">
                <div class="clearfix">
                  multisig list(
                  {{multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts.length}}
                  )
                </div>
                <div v-if="
                      multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts.length == 0">
                  this account does not own any multisig account
                </div>
                <div
                  v-for="(m, i) in multisig.multisigInfo[wallet.activeWallet.name].multisigAccounts"
                  v-else
                  :key="i"
                  class="clearfix"
                >
                  {{ m.publicKey }}
                </div>
              </div>
              <div>
                <div>
                  cosigner list(
                  {{multisig.multisigInfo[wallet.activeWallet.name].cosignatories.length}}
                  )
                </div>
                <div v-if="
                       multisig.multisigInfo[wallet.activeWallet.name].cosignatories.length == 0">
                  this account does not own any cosigner
                </div>
                <div
                        v-for="
                        (c, i) in multisig.multisigInfo[wallet.activeWallet.name].cosignatories"
                        v-else
                        :key="i"
                        class="clearfix"
                >
                  {{ c.publicKey }}
                </div>
              </div>

            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>

import { mapState } from 'vuex';
import { GET_MULTISIG_MODES } from '../../infrastructure/multisig/multisig-types';

export default {
  name: 'MultisigInfo',
  computed: mapState([
    'wallet',
    'application',
    'multisig',
  ]),
  methods: {
    reloadMultisigInfo(wallet) {
      console.log(this.multisig.multisigInfo[this.wallet.activeWallet.name])
      this.$store.dispatch('multisig/REFRESH_MULTISIG_INFO', {
        wallet,
        mode: GET_MULTISIG_MODES.RELOAD,
      });
    },
  },
};

</script>
