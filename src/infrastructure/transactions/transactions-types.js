/* eslint-disable import/prefer-default-export */

import { TransactionType } from 'nem2-sdk';

export const GET_TRANSACTIONS_MODES = {
  INIT: 'init',
  REFRESH: 'refresh',
  MORE: 'more',
};

// Based on https://nemtech.github.io/concepts/transaction.html#transaction-types
export const txCategories = {
  Transfer: [
    TransactionType.TRANSFER,
  ],
  Namespace: [
    TransactionType.REGISTER_NAMESPACE,
    TransactionType.ADDRESS_ALIAS,
    TransactionType.MOSAIC_ALIAS,
  ],
  Mosaic: [
    TransactionType.MOSAIC_DEFINITION,
    TransactionType.MOSAIC_SUPPLY_CHANGE,
  ],
  Multisignature: [
    TransactionType.MODIFY_MULTISIG_ACCOUNT,
    TransactionType.LOCK,
  ],
  'Cross-chain swap': [
    TransactionType.SECRET_LOCK,
    TransactionType.SECRET_PROOF,
  ],
  'Account filter': [
    TransactionType.MODIFY_ACCOUNT_PROPERTY_ADDRESS,
    TransactionType.MODIFY_ACCOUNT_PROPERTY_MOSAIC,
    TransactionType.MODIFY_ACCOUNT_PROPERTY_ENTITY_TYPE,
  ],
  'Remote harvesting': [
    TransactionType.LINK_ACCOUNT,
  ],
};

export const txTypeNames = [
  'Transfer',
  'Register namespace',
  'Address alias',
  'Mosaic alias',
  'Mosaic definition',
  'Mosaic supply change',
  'Modify multisig account',
  'Aggregate complete',
  'Aggregate bonded',
  'Lock',
  'Secret lock',
  'Secret proof',
  'Mod. account address',
  'Mod. account mosaic',
  'Mod. account entity type',
  'Link account',
];

export const txTypeNameFromTypeId = (typeId) => {
  switch (typeId) {
  case TransactionType.TRANSFER: return 'Transfer';
  case TransactionType.REGISTER_NAMESPACE: return 'Register namespace';
  case TransactionType.ADDRESS_ALIAS: return 'Address alias';
  case TransactionType.MOSAIC_ALIAS: return 'Mosaic alias';
  case TransactionType.MOSAIC_DEFINITION: return 'Mosaic definition';
  case TransactionType.MOSAIC_SUPPLY_CHANGE: return 'Mosaic supply change';
  case TransactionType.MODIFY_MULTISIG_ACCOUNT: return 'Modify multisig account';
  case TransactionType.AGGREGATE_COMPLETE: return 'Aggregate complete';
  case TransactionType.AGGREGATE_BONDED: return 'Aggregate bonded';
  case TransactionType.LOCK: return 'Lock';
  case TransactionType.SECRET_LOCK: return 'Secret lock';
  case TransactionType.SECRET_PROOF: return 'Secret proof';
  case TransactionType.MODIFY_ACCOUNT_PROPERTY_ADDRESS: return 'Mod. account address';
  case TransactionType.MODIFY_ACCOUNT_PROPERTY_MOSAIC: return 'Mod. account mosaic';
  case TransactionType.MODIFY_ACCOUNT_PROPERTY_ENTITY_TYPE: return 'Mod. account entity type';
  case TransactionType.LINK_ACCOUNT: return 'Link account';
  default: return new Error('The transaction ID was not found');
  }
};


export const txFilterNameFromName = typeName => typeName
  .replace(/ /g, '_').replace(/\./g, '8');


export const transactionTypesFilters = () => {
  const filters = {};
  const typeNamesToExclude = [
    'Aggregate complete',
    'Aggregate bonded',
    'The transaction ID was not found',
  ];

  Object.keys(TransactionType).forEach((key) => {
    const typeName = txTypeNameFromTypeId(TransactionType[key]);
    if (typeNamesToExclude.indexOf(typeName) === -1) {
      // Hacky trick to preserve reactivity while keeping a simple object
      const typeIndex = txFilterNameFromName(typeName);
      filters[typeIndex] = true;
    }
  });

  return filters;
};

export const FilterType = {
  ADDRESS_FILTER: 0X01,
  MOSAIC_FILTER: 0X02,
  ENTITY_FILTER: 0X04,
};
