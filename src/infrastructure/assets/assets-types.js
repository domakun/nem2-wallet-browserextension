/* eslint-disable import/prefer-default-export */
export const GET_ASSETS_MODES = {
  ON_WALLET_CHANGE: 'onWalletChange',
  RELOAD: 'reload',
};

export class NetworkAsset {
  constructor(assetId, name) {
    this.assetId = assetId;
    this.name = name;
  }
}
