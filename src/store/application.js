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
import fetch from 'node-fetch';
import { BlockHttp } from 'nem2-sdk';
import { timestampNemesisBlock } from '../infrastructure/network/types';

const officialNodeListURL = 'https://api.nemesis.land/nodes';
// const officialNodeListURL = 'http://13.114.200.132:8000/assets/api-address.json';

const state = {
  error: false,
  errorMessage: '',
  listenerStatus: 'off',
  listenerErrorMessage: false,
  routeName: '',
  darkMode: false,
  showSnackbar: false,
  snackbarText: '',
  blockNumber: 'loading',
  blocks: [],
  activeNode: false,
  generationHashes: false,
  officialNodes: false,
};

const getters = {
  GET_ERROR_STATE() {
    return state.error;
  },
  GET_ERROR_MESSAGE() {
    return state.errorMessage;
  },
  GET_BLOCKS() {
    return state.blocks;
  },
  GET_ACTIVE_NODE() {
    return state.activeNode;
  },
};

const mutations = {
  resetErrors(state) {
    state.error = false;
    state.errorMessage = '';
  },
  setError(state, errMsg) {
    state.error = true;
    state.errorMessage = errMsg;
  },
  updateRouteName(state, routeName) {
    state.routeName = routeName;
  },
  toggleDarkMode(state) {
    state.darkMode = !state.darkMode;
  },
  setSnackbarText(state, text) {
    state.snackbarText = text;
  },
  setListenerStatus(state, status, text) {
    state.listenerStatus = status;
    state.listenerErrorMessage = text;
  },
  setBlockNumber(state, blockNumber) {
    state.blockNumber = blockNumber;
  },
  addBlock(state, formattedBlock) {
    if (state.blocks.length >= 100) state.blocks.shift();
    state.blocks.push(formattedBlock);
  },
  setActiveNode(state, node) {
    state.activeNode = node;
  },
  setGenerationHash(state, { endpoint, generationHash }) {
    if (!state.generationHashes) state.generationHashes = [];
    Vue.set(state.generationHashes, endpoint, generationHash);
  },
  setOfficialNodes(state, nodes) {
    state.officialNodes = nodes;
  },
};

const actions = {
  RESET_ERRORS({ commit }) {
    commit('resetErrors');
  },


  SET_ERROR({ commit }, errorMessage) {
    const errMsg = typeof errorMessage === 'string'
      ? errorMessage : errorMessage.toString();
    commit('setError', errMsg);
  },


  SET_LISTENER_STATUS({ commit }, { status, text }) {
    commit('setListenerStatus', status, text);
  },


  NAVIGATE({ commit }, { to }) {
    commit('updateRouteName', to.name);
  },


  TOGGLE_DARK_MODE({ commit }) {
    commit('toggleDarkMode');
  },


  SET_SNACKBAR_TEXT({ commit }, { text }) {
    commit('setSnackbarText', text);
  },


  SET_BLOCK_NUMBER({ commit }, blockNumber) {
    commit('setBlockNumber', blockNumber);
  },


  ADD_BLOCK({ commit, dispatch }, block) {
    const blockNumber = block.height.compact();
    dispatch('SET_BLOCK_NUMBER', blockNumber);

    const timestamp = block.timestamp.compact() / 1000 + timestampNemesisBlock;
    commit('addBlock', {
      blockNumber,
      timestamp,
    });
  },


  SET_GENERATION_HASH({ commit, dispatch, rootState }) {
    return new Promise(async (resolve, reject) => {
      const endpoint = rootState.application.activeNode;
      try {
        const blockHttp = new BlockHttp(endpoint);
        const block = await blockHttp.getBlockByHeight(1).toPromise();
        const { generationHash } = block;
        commit('setGenerationHash', { endpoint, generationHash });
        resolve(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error at SET_GENERATION_HASH, ${error}`);
        const errorMessage = `
        We could not connect to the endpoint you are currently using
        (${endpoint}), please check your internet connection, or try
        to use another node`;
        dispatch('SET_ALL_LOADING_STATES', false);
        commit('setBlockNumber', 'error');
        dispatch('SET_ERROR', errorMessage);
        reject(error);
      }
    });
  },


  async RESET_WALLET_DATA({ dispatch, rootState }) {
    const { activeWallet } = rootState.wallet;
    await Promise.all([
      dispatch('accountInfo/CLEAR_ACCOUNT_INFO', activeWallet, { root: true }),
      dispatch('assets/CLEAR_ASSETS', activeWallet, { root: true }),
      dispatch('multisig/CLEAR_MULTISIG_INFO', activeWallet, { root: true }),
      dispatch('namespaces/CLEAR_NAMESPACES', activeWallet, { root: true }),
      dispatch('transactions/CLEAR_TRANSACTIONS', activeWallet, { root: true }),
    ]);
  },


  async SET_ALL_LOADING_STATES({ commit, dispatch }, bool) {
    const promises = [
      commit(
        'accountInfo/setLoading_getAccountInfo',
        bool, { root: true },
      ),
      commit(
        'multisig/setLoading_getMultisigInfo',
        bool, { root: true },
      ),
      commit(
        'assets/setLoading_getMosaicsByAddress',
        bool, { root: true },
      ),
      commit(
        'multisig/setLoading_getMultisigInfo',
        bool, { root: true },
      ),
    ];

    if (bool) {
      promises.push(dispatch('SET_BLOCK_NUMBER', 'loading'));
    }

    await Promise.all(promises);
  },


  async CHANGE_CURRENT_NODE({ commit, dispatch, rootState }, newActiveNode) {
    try {
      await Promise.all([
        await commit('setActiveNode', newActiveNode),
        await dispatch('RESET_ERRORS'),
        await dispatch('RESET_WALLET_DATA'),
      ]);

      dispatch(
        'wallet/FETCH_WALLET_DATA',
        rootState.wallet.activeWallet,
        { root: true },
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`error at CHANGE_CURRENT_NODE, ${error}`);
    }
  },


  async FETCH_OFFICIAL_NODES({ commit }) {
    try {
      const nodes = await fetch(officialNodeListURL);
      if (nodes.ok) {
        const response = await nodes.json();
        const defaultNodes = response.data
          && response.data instanceof Array && response.data.length > 0
          ? response.data : false;
        if (defaultNodes) {
          commit('setOfficialNodes', defaultNodes);
        }
        return (new Error('An error occured when getting the result from the official node list link.'));
      }
      // eslint-disable-next-line no-console
      console.error('An error occured when fetching the official node list.', 'FETCH_OFFICIAL_NODES');
      return (new Error('An error occured when fetching the official node list.'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'FETCH_OFFICIAL_NODES');
      return (error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
