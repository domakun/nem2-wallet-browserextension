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

/* eslint-disable max-len */
import {
  UInt64, Address, AliasActionType,
} from 'nem2-sdk';

// eslint-disable-next-line import/prefer-default-export
export const formatNamespaces = (namespacesInfo, blockHeight) => namespacesInfo.filter((ns, index, namespaces) => {
  for (let i = 0; i < index; i += 1) {
    if (ns === namespaces[i]) return false;
  }
  return true;
}).sort((a, b) => {
  const nameA = a.namespaceInfo.metaId;
  const nameB = b.namespaceInfo.metaId;
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}).map((ns, index, original) => {
  const name = ns.namespaceInfo.levels.map(level => original
    .find(n => n.namespaceInfo.id.equals(level))).map(n => n.namespaceName.name).join('.');
  const namespaceType = ns.namespaceInfo.type;
  let aliasText;
  let aliasType;
  switch (ns.namespaceInfo.alias.type) {
  case 1:
    aliasText = (new UInt64(ns.namespaceInfo.alias.mosaicId)).toHex().toUpperCase();
    aliasType = 'mosaic alias:';
    break;
  case 2:
    aliasText = Address.createFromEncoded(ns.namespaceInfo.alias.address).pretty();
    aliasType = 'address alias:';
    break;
  default:
    aliasText = '';
    aliasType = 'no alias';
    break;
  }
  const endHeight = ns.namespaceInfo.endHeight.compact();
  const expireWithin = ns.namespaceInfo.endHeight.compact() - blockHeight;
  const expireText = expireWithin > 0
    ? `expires within ${expireWithin.toLocaleString()} blocks`
    : `expired ${(-expireWithin).toLocaleString()} blocks ago`;
  return {
    name,
    namespaceType,
    endHeight,
    hexId: ns.namespaceInfo.id.toHex().toUpperCase(),
    type: aliasType,
    alias: aliasText,
    expire: expireText,
    active: expireWithin > 0,
    expand: {
      isExpandMore: false,
      namespaceName: name,
      aliasActionType:
          ns.namespaceInfo.alias.type === 0 ? AliasActionType.Link : AliasActionType.Unlink,
      currentAliasType: ns.namespaceInfo.alias.type,
      currentAlias: ns.namespaceInfo.alias.type === 0 ? '' : aliasText,
    },
  };
});
