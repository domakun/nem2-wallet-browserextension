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
import getMosaicsByAddress from '../infrastructure/assets/getMosaicsByAddress';
import { GET_ASSETS_MODES, NetworkAsset } from '../infrastructure/assets/assets-types';

const state = {
  assets: false,
  networkAssets: false,
  loading_getMosaicsByAddress: false,
};

const getters = {
  GET_ASSETS(state, getters, rootState) {
    return state.assets[rootState.wallet.activeWallet.name];
  },
};

const mutations = {
  setAccountAssets(state, { wallet, assets }) {
    if (!state.assets) state.assets = {};
    Vue.set(state.assets, wallet.name, assets);
  },
  addNetworkAsset(state, { generationHash, assets }) {
    if (!state.networkAssets) state.networkAssets = {};
    Vue.set(state.networkAssets, generationHash, assets);
  },
  setLoading_getMosaicsByAddress(state, bool) {
    state.loading_getMosaicsByAddress = bool;
  },
};

const actions = {
  async CLEAR_ASSETS({ commit }, wallet) {
    commit('setAccountAssets', { wallet, assets: false });
  },


  SET_NETWORK_ASSETS({ rootState, commit }, { assets, generationHash }) {
    const genHash = generationHash || rootState.application
      .generationHashes[rootState.application.activeNode];
    commit('addNetworkAsset', { assets, generationHash: genHash });
  },


  UPDATE_NETWORK_ASSETS({ rootState, commit }, { assets, generationHash }) {
    const genHash = generationHash || rootState.application
      .generationHashes[rootState.application.activeNode];

    const assetsToAdd = !state.networkAsset || !state.networkAsset.genHash
      ? assets.map(asset => new NetworkAsset(asset.id, asset.name))
      : assets
        .filter(asset => state.networkAsset.genHash
          .findIndex(({ assetId }) => assetId === asset.id) === -1)
        .map(asset => new NetworkAsset(asset.id, asset.name));

    const allAssets = state.networkAssets && state.networkAssets[genHash]
      ? [...state.networkAssets[genHash], ...assetsToAdd]
      : assetsToAdd;

    commit('addNetworkAsset', { assets: allAssets, generationHash: genHash });
  },


  ADD_NETWORK_ASSETS({ rootState, commit }, { assets, generationHash }) {
    const genHash = generationHash || rootState.application
      .generationHashes[rootState.application.activeNode];

    const allAssets = state.networkAssets && state.networkAssets[genHash]
      ? [...state.networkAssets[genHash], ...assets]
      : assets;
    commit('addNetworkAsset', { assets: allAssets, generationHash: genHash });
  },


  async GET_ASSETS_BY_ADDRESS({
    commit,
    dispatch,
    getters,
    rootState,
  }, { wallet, mode }) {
    if (mode === GET_ASSETS_MODES.ON_WALLET_CHANGE
      && getters.GET_ASSETS) return;

    await commit('setLoading_getMosaicsByAddress', true);

    try {
      const assets = await getMosaicsByAddress(
        wallet, rootState.application.activeNode,
      );
      commit('setAccountAssets', { wallet, assets });
      dispatch('UPDATE_NETWORK_ASSETS', { assets });
    } catch (error) {
      dispatch('application/SET_ERROR', error, { root: true });
      // eslint-disable-next-line no-console
      console.error(error, 'GET_ASSETS_BY_ADDRESS');
    }
    commit('setLoading_getMosaicsByAddress', false);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
