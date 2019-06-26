/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/**
 * Copyright (C) 2019 Contributors as noted in the AUTHORS file
 *
 * This file is part of nem2-wallet-browserextension.
 *
 * nem2-wallet-browserextension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * nem2-wallet-browserextension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with nem2-wallet-browserextension.  If not, see <http://www.gnu.org/licenses/>.
 */
import Vue from 'vue';
import { MosaicId, MosaicHttp, NamespaceHttp } from 'nem2-sdk';
import getAccountTransactionsById from '../infrastructure/transactions/getAccountTransactionsById';
import { removeDuplicatesAndSortByBlockNumber, formatTransactions } from '../infrastructure/transactions/formatTransactions';
import {
  transactionTypesFilters,
  txCategories,
  txTypeNameFromTypeId,
  txTypeNames,
  txFilterNameFromName,
} from '../infrastructure/transactions/transactions-types';
import { NetworkAsset } from '../infrastructure/assets/assets-types';

const state = {
  transactions: false,
  loading_getAccountTransactionsById: false,
  transactionTypesFilters: transactionTypesFilters(),
  activeTransaction: false,
  createdURI: [],
  receivedURI: [],
};

const getters = {
  GET_TRANSACTIONS(state, getters, rootState) {
    return state.transactions[rootState.wallet.activeWallet.name];
  },
  GET_FIRST_TRANSACTION() {
    return state.transactions[0];
  },
};

const mutations = {
  setAccountTransactions(state, { wallet, transactions }) {
    if (!state.transactions) state.transactions = [];
    Vue.set(state.transactions, wallet.name, transactions);
  },
  setLoading_getAccountTransactionsById(state, bool) {
    state.loading_getAccountTransactionsById = bool;
  },
  clearTransactons(state, wallet) {
    state.transactons[wallet.name] = false;
  },
  resetTransactionFilters(state, defaultFilters) {
    state.transactionTypesFilters = defaultFilters;
  },
  toggleTransactionTypesFilter(state, filter) {
    state.transactionTypesFilters[filter] = !state.transactionTypesFilters[filter];
  },
  updateTransactionTypesFilter(state, { filter, bool }) {
    state.transactionTypesFilters[filter] = bool;
  },
  updateActiveTransaction(state, transaction) {
    // eslint-disable-next-line prefer-destructuring
    state.activeTransaction = transaction;
  },
  saveCreatedUri(state, { wallet, uriTransaction }) {
    if (!state.createdURI[wallet.name]) state.createdURI[wallet.name] = [];
    Vue.set(state.createdURI, wallet.name, [...state.createdURI[wallet.name], uriTransaction]);
  },
  saveReceivedUri(state, { uriTransaction }) {
    if (!state.receivedURI) state.receivedURI = [];
    state.receivedURI = [...state.receivedURI, uriTransaction];
  },
};

const actions = {
  async CLEAR_TRANSACTIONS({ commit }, wallet) {
    commit('setAccountTransactions', { wallet, transactions: false });
  },


  async HANDLE_NEW_TRANSACTIONS({ dispatch, rootState }, transactions) {
    const { activeNode } = rootState.application;
    const generationHash = rootState.application.generationHashes[activeNode];
    const networkAssets = rootState.assets.networkAssets[generationHash] || [];

    const mosaicIdsToLookup = [];
    const namespaceIdsToLookup = [];
    const flattenedNewTxWithMosaics = [];

    // @TODO: could alsto take mosaicId keys
    // (eg MosaicDefinitionTransaction, MosaicSupplyChangeTransaction)

    // Retrieve all the mosaics present in the transactions
    transactions.forEach((tx) => {
      if (Object.keys(tx).indexOf('mosaics') > -1) {
        flattenedNewTxWithMosaics.push(tx);
        return;
      }
      if (Object.keys(tx).indexOf('innerTransactions') > -1) {
        tx.innerTransactions.forEach((itx) => {
          if (Object.keys(itx).indexOf('mosaics') > -1) {
            flattenedNewTxWithMosaics.push(itx);
          }
        });
      }
    });

    // Split the mosaic we found in 3 categories:
    // The ones we already have the name of, the ones that have a MosaicId as an Id
    // and the ones that have a NamespaceId as an Id
    flattenedNewTxWithMosaics.forEach((t) => {
      t.mosaics.forEach((m) => {
        if (networkAssets.findIndex(({ assetId }) => assetId === m.id.toHex()) > -1) return;

        // eslint-disable-next-line default-case
        switch (m.id instanceof MosaicId) {
        case true:
          if (mosaicIdsToLookup
            .findIndex(({ id }) => id.toHex() === m.id.toHex()) > -1) return;
          mosaicIdsToLookup.push(m.id);
          break;
        case false:
          if (namespaceIdsToLookup
            .findIndex(({ id }) => id.toHex() === m.id.toHex()) > -1) return;
          namespaceIdsToLookup.push(m.id);
          break;
        }
      });
    });

    // Get NamespacesNames from the network
    let newlyNamedNamespaces = [];
    if (namespaceIdsToLookup.length > 0) {
      const namespaceNames = await new NamespaceHttp(rootState.application.activeNode)
        .getNamespacesName(namespaceIdsToLookup)
        .toPromise();
      newlyNamedNamespaces = namespaceNames.map(m => new NetworkAsset(
        // @TODO: this does not really work, as it does not return
        // the full name of a namespace. I think that the SDK should return
        // the full name in the same fashion as the getMosaicsNames method
        m.namespaceId.id.toHex(),
        m.name,
      ));
    }

    // @TODO: could store the names from the namespaces fetched in the store/namespaces
    // Get MosaicNames from the network
    let newlyNamedMosaics = [];
    if (mosaicIdsToLookup.length > 0) {
      const mosaicNames = await new MosaicHttp(rootState.application.activeNode)
        .getMosaicsNames(mosaicIdsToLookup)
        .toPromise();

      newlyNamedMosaics = mosaicNames.map(m => new NetworkAsset(
        m.mosaicId.id.toHex(),
        m.names.length > 0 ? m.names[0].name : false,
      ));
    }

    // Merge all the HexId => Names pairs we have, update them
    // And return formatted transactions
    const allNamedAssets = [...newlyNamedNamespaces, ...newlyNamedMosaics, ...networkAssets];
    dispatch('assets/SET_NETWORK_ASSETS', { assets: allNamedAssets }, { root: true });
    const formattedTransactions = await formatTransactions(transactions, allNamedAssets);
    return formattedTransactions;
  },


  async GET_TRANSACTIONS_BY_ID({
    commit,
    dispatch,
    getters,
    rootState,
  }, { wallet, mode }) {
    await commit('setLoading_getAccountTransactionsById', true);
    const actualTransactions = getters.GET_TRANSACTIONS;
    let currentId;
    try {
      switch (mode) {
      case 'more':
        // eslint-disable-next-line no-case-declarations
        currentId = actualTransactions && actualTransactions.length > 0
          ? actualTransactions[actualTransactions.length - 1].id
          : undefined;
        break;
      case 'init':
      case 'refresh':
      default:
        currentId = undefined;
        break;
      }

      const newTransactions = await getAccountTransactionsById({
        wallet,
        currentId,
        activeNode: rootState.application.activeNode,
      });


      if (!newTransactions) {
        await commit('setAccountTransactions', {
          wallet,
          transactions: ['Error'],
        });
        return;
      }

      const newFormattedTx = await dispatch('HANDLE_NEW_TRANSACTIONS', newTransactions);

      const oldTransactions = getters.GET_TRANSACTIONS || [];
      const transactionsToStore = removeDuplicatesAndSortByBlockNumber([
        ...oldTransactions,
        ...newFormattedTx,
      ]);

      if (mode === 'init') await commit('updateActiveTransaction', transactionsToStore[0]);

      await commit('setAccountTransactions', {
        wallet,
        transactions: transactionsToStore,
      });
    } catch (error) {
      dispatch('application/SET_ERROR', error, { root: true });
      // eslint-disable-next-line no-console
      console.error(error, 'GET_TRANSACTIONS_BY_ID');
    }

    commit('setLoading_getAccountTransactionsById', false);
  },


  RESET_TRANSACTION_FILTERS({ commit }) {
    commit('resetTransactionFilters', transactionTypesFilters());
  },


  TOGGLE_TRANSACTION_TYPES_FILTERS({ commit }, filter) {
    commit('toggleTransactionTypesFilter', filter);
  },


  async UPDATE_TRANSACTION_TYPES_PRESET_FILTER({ commit }, txCategory) {
    const txTypesFiltersToExclude = [];
    Object.keys(txCategories)
      .forEach((category) => {
        if (txCategory.indexOf(category) > -1) {
          txCategories[category].forEach(txType => txTypesFiltersToExclude
            .push(txTypeNameFromTypeId(txType)));
        }
      });

    txTypeNames.forEach((txFilter) => {
      const bool = txTypesFiltersToExclude.indexOf(txFilter) !== -1;
      commit('updateTransactionTypesFilter', {
        filter: txFilterNameFromName(txFilter),
        bool,
      });
    });
  },


  UPDATE_ACTIVE_TRANSACTION({ commit }, transaction) {
    commit('updateActiveTransaction', transaction);
  },


  async FORMAT_TRANSACTION_FROM_LISTENER({ dispatch, commit, getters }, { transaction, wallet }) {
    try {
      const formattedTx = await dispatch('HANDLE_NEW_TRANSACTIONS', [transaction]);
      const unconfirmedTx = formattedTx.map(tx => ({ ...tx, unconfirmed: true }));

      const oldTransactions = await getters.GET_TRANSACTIONS || [];
      const transactionsToStore = [...unconfirmedTx, ...oldTransactions];

      commit('setAccountTransactions', {
        wallet,
        transactions: transactionsToStore,
      });

      unconfirmedTx.forEach(tx => dispatch(
        'TRIGGER_TRANSACTION_SNACKBAR',
        { tx, status: 'announced' },
      ));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'FORMAT_TRANSACTION_FROM_LISTENER');
    }
  },


  async CONFIRM_TRANSACTION({
    dispatch,
    getters,
    rootGetters,
    commit,
  }, { transaction, wallet }) {
    try {
      const blocks = await rootGetters['application/GET_BLOCKS'];
      const getTimestampFromBlock = (blockNumber) => {
        const block = blocks.find(x => x.blockNumber === blockNumber);
        if (block === undefined) return 0;
        return block.timestamp;
      };

      const txWithTimestamp = {
        ...transaction,
        timestamp: getTimestampFromBlock(transaction.transactionInfo.height.compact()),
      };

      const formattedTx = await dispatch('HANDLE_NEW_TRANSACTIONS', [txWithTimestamp]);

      const confirmedTx = formattedTx.map(tx => ({ ...tx, unconfirmed: false }));

      const oldTransactions = await getters.GET_TRANSACTIONS || [];
      const oldConfirmedTransactions = oldTransactions.filter(tx => !tx.unconfirmed);
      const unconfirmedTransactionsToUpdate = oldTransactions.filter(tx => tx.unconfirmed);

      const unconfirmedTransactionsUpdated = unconfirmedTransactionsToUpdate
        .map((tx) => {
          const confirmedTransaction = confirmedTx
            .find(ctx => ctx.transactionHash === tx.transactionHash);
          if (confirmedTransaction === undefined) return tx;
          return [];
        })
        .filter(x => x.length > 0);

      const transactionsToStore = [
        ...unconfirmedTransactionsUpdated,
        ...confirmedTx,
        ...oldConfirmedTransactions,
      ];

      commit('setAccountTransactions', {
        wallet,
        transactions: transactionsToStore,
      });

      confirmedTx.forEach(tx => dispatch(
        'TRIGGER_TRANSACTION_SNACKBAR',
        { tx, status: 'confirmed' },
      ));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'CONFIRM_TRANSACTION');
    }
  },


  TRIGGER_TRANSACTION_SNACKBAR({ dispatch }, { tx, status }) {
    dispatch(
      'application/SET_SNACKBAR_TEXT',
      { bool: true, text: `New ${tx.type1} ${status}!` },
      { root: true },
    );
  },

  SAVE_CREATED_URI({ commit }, { wallet, uriTransaction }) {
    commit('saveCreatedUri', {
      wallet,
      uriTransaction,
    });
  },
  SAVE_RECEIVED_URI({ commit }, { uriTransaction }) {
    commit('saveReceivedUri', {
      uriTransaction,
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
