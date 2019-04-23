/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
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

import {
  walletsToJSON,
  jsonToWallets,
} from '../infrastructure/wallet';

import { Wallet } from './wallet-types';
import { GET_TRANSACTIONS_MODES } from './transactions-types';

const state = {
  activeWallet: false,
  wallets: [],
  // @TODO: walletNumber is a quickfix, to be replaced in the future
  walletNumber: 0,
};

const getters = {
  GET_WALLETS() {
    return state.wallets;
  },
  GET_ACTIVE_WALLET() {
    return state.activeWallet;
  },
};

const mutations = {
  setActiveWallet(state, newActiveWallet) {
    state.activeWallet = newActiveWallet;
  },
  addWallet(state, newWallet) {
    state.wallets.push(newWallet);
    state.walletNumber += 1;
  },
  addWalletsFromStorage(state, wallets) {
    state.wallets = wallets;
    state.walletNumber += wallets.length;
  },
  removeWallet(state, indexOfWalletToRemove) {
    state.wallets.splice(indexOfWalletToRemove);
  },
};

const actions = {
  // @TODO:Move application initialization to a more suitable place (application store?)
  async INIT_APPLICATION({ dispatch, commit }) {
    const localStorageWallets = localStorage.getItem('wallets');
    if (!(localStorageWallets.length > 0)) return;

    const wallets = jsonToWallets(localStorageWallets);
    await commit('addWalletsFromStorage', wallets);
    const activeWallet = wallets[0];
    await commit('setActiveWallet', activeWallet);

    await dispatch('FETCH_WALLET_DATA', activeWallet);
  },
  async ADD_WALLET({ commit, getters }, walletData) {
    const newWallet = new Wallet(walletData);

    // no wallet name duplicate @TODO add snackbar message
    if (getters.GET_WALLETS.map(({ name }) => name).indexOf(walletData.name) > -1) return;

    await commit('addWallet', newWallet);

    if (!getters.GET_ACTIVE_WALLET) {
      commit('setActiveWallet', newWallet);
    }

    const walletsToStore = [...getters.GET_WALLETS];
    localStorage.setItem('wallets', walletsToJSON(walletsToStore));
  },
  SET_ACTIVE_WALLET({ commit, dispatch }, newActiveWalletName) {
    if (state.activeWallet.name === newActiveWalletName) return;
    if (state.wallets.map(({ name }) => name)
      .indexOf(newActiveWalletName) === -1) return;

    const newActiveWallet = state.wallets
      .find(wallet => wallet.name === newActiveWalletName);

    commit('setActiveWallet', newActiveWallet);
    dispatch('FETCH_WALLET_DATA', newActiveWallet);
  },
  async REMOVE_WALLET({ commit, getters, dispatch }, walletName) {
    const indexOfWalletToRemove = getters.GET_WALLETS
      .findIndex(({ name }) => name === walletName);

    await commit('removeWallet', indexOfWalletToRemove);

    const wallets = getters.GET_WALLETS;

    dispatch('application/RESET_ERRORS', null, { root: true });

    // @TODO:Refactor erase account info and move to a more suitable place
    dispatch('accountInfo/ERASE_ACCOUNT_INFO', null, { root: true });
    dispatch('transactions/ERASE_TRANSACTIONS', null, { root: true });

    if (getters.GET_ACTIVE_WALLET.name === walletName) {
      if (wallets.length > 0) {
        commit('setActiveWallet', getters.GET_WALLETS[0]);
      } else {
        commit('setActiveWallet', false);
      }
    }

    localStorage.setItem('wallets', walletsToJSON(wallets));
  },
  async FETCH_WALLET_DATA({ dispatch }, wallet) {
    if (wallet === false) return;
    try {
      await dispatch('accountInfo/FETCH_ACCOUNT_INFO', wallet, { root: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'FETCH_WALLET_DATA');
      return;
    }
    await dispatch(
      'transactions/GET_TRANSACTIONS_BY_ID',
      { wallet, mode: GET_TRANSACTIONS_MODES.INIT }, { root: true },
    );
    await dispatch(
      'namespaces/GET_NAMESPACES_BY_ADDRESS',
      { wallet }, { root: true },
    );
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
