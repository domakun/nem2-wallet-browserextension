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

/* eslint-disable indent */

import { TransactionType, Address } from 'nem2-sdk';
import { txTypeNameFromTypeId } from './transactions-types';


export const formatDate = (d) => {
  let date = d.getDate();
  let month = d.getMonth() + 1;
  const year = d.getFullYear();
  let hours = d.getHours();
  let minutes = d.getMinutes();
  if (date < 10) date = `0${date}`;
  if (month < 10) month = `0${month}`;
  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;
  return `${year.toString().substring(2)}/${month}/${date} ${hours}:${minutes}`;
};

const getBody = (tx, namedAssets) => new Promise(async (resolve, reject) => {
    try {
    // The body items will be displayed iteratively as the keys depend on the transaction type
    // The key order will dictate the display order
    const body = [];

    // mainprops and type1 are fixed fields that display in the transaction rows
    // mainprops takes a maximum of argument of 4 items (4 lines in the row)
    // The key order will dictate the display order
    let mainProps = [];

    switch (tx.type) {
        case TransactionType.TRANSFER:
            // eslint-disable-next-line no-case-declarations
            let maxNumberOfMosaicsInMainProps = 4;

            if (tx.message.payload !== '') {
              body.push({ key: 'Message', value: tx.message.payload });
              mainProps.push({ key: 'message: ', value: tx.message.payload });
              maxNumberOfMosaicsInMainProps = 3;
            }

            if (tx.mosaics.length > 0) {
              let int = 0;

              const mosaics = tx.mosaics.map((mosaic) => {
                const { name } = namedAssets
                  .find(namedMosaic => namedMosaic.assetId === mosaic.id.toHex());
                return { ...mosaic, name };
              });
              mosaics.forEach((mosaic) => {
                  int += 1;
                  body.push(
                      { key: `Amount ${int}`, value: mosaic.amount.compact().toLocaleString() },
                      {
                          key: `Asset ID ${int}`,
                          value: mosaic.name
                            ? `${mosaic.name} (${mosaic.id.toHex()})`
                            : mosaic.id.toHex(),
                      },
                  );
                  if (int <= maxNumberOfMosaicsInMainProps) {
                    mainProps.push(
                      {
                        key: mosaic.amount.compact().toLocaleString(),
                        value: mosaic.name
                          ? `${mosaic.name} (${mosaic.id.toHex()})`
                          : mosaic.id.toHex(),
                      },
                    );
                  }
              });
            }

            break;

        case TransactionType.REGISTER_NAMESPACE:
            // eslint-disable-next-line no-case-declarations
            let childOf = false;
            // eslint-disable-next-line no-case-declarations
            let namespaceName;
            switch (tx.namespaceType) {
                case 1:
                    // This is a child namespace
                    body.push(
                      { key: 'Namespace Name', value: tx.namespaceName },
                      { key: 'Duration (blocks)', value: 0 },
                      { key: 'Parent Namespace Id', value: tx.parentId.toHex().toLowerCase() },
                    );
                  // eslint-disable-next-line no-case-declarations
                  childOf = { key: 'Child of: ', value: tx.parentId.toHex().toLowerCase() };
                  mainProps = [childOf];
                    break;

                default:
                    // This is a root-level namespace
                    body.push(
                      { key: 'Namespace Name', value: tx.namespaceName },
                      { key: 'Duration (blocks)', value: tx.duration.compact().toLocaleString() },
                    );
                    namespaceName = { key: 'name: ', value: tx.namespaceName };
                  mainProps = [namespaceName];
                  break;
            }
            break;

        case TransactionType.ADDRESS_ALIAS:
            body.push(
                {
                  key: 'Alias action type',
                  value: tx.actionType === 1 ? 'Link' : 'Unlink',
                },
                { key: 'Address', value: new Address(tx.address.address).pretty() },
                {
                  key: 'Namespace Id',
                  value: tx.namespaceId.toHex().toLowerCase(),
                },
            );

            mainProps.push({
              key: tx.actionType === 0 ? 'Link namespace: ' : 'Unlink namespace: ',
              value: tx.namespaceId.toHex().toLowerCase(),
            });

            break;

        case TransactionType.MOSAIC_ALIAS:
            body.push(
                {
                  key: 'Alias action type',
                  value: tx.actionType === 1 ? 'Link' : 'Unlink',
                },
                { key: 'Mosaic Id', value: tx.mosaicId.toHex().toLowerCase() },
                {
                    key: 'Namespace Id',
                    value: tx.namespaceId.toHex().toLowerCase(),
                },
            );

            mainProps.push(
              {
                key: tx.actionType === 0 ? 'Link mosaic Id: ' : 'Unlink mosaic Id: ',
                value: tx.mosaicId.toHex().toLowerCase(),
              },
              {
                key: tx.actionType === 0 ? 'to namespace: ' : 'from namespace: ',
                value: tx.namespaceId.toHex().toLowerCase(),
              },
            );

            break;

        case TransactionType.MOSAIC_DEFINITION:
            body.push(
                { key: 'Mosaic Id', value: tx.mosaicId.toHex().toLowerCase() },
                {
                  key: 'Divisibility (decimals)',
                  value: tx.mosaicProperties.divisibility,
                },
                {
                  key: 'Duration (blocks)',
                  value: (tx.mosaicProperties.duration === undefined
                      || tx.mosaicProperties.duration.compact() === 0)
                      ? 'unlimited'
                      : tx.mosaicProperties.duration.compact().toLocaleString(),
                },
                {
                  key: 'Levy mutable',
                  value: tx.mosaicProperties.levyMutable,
                },
                {
                  key: 'Supply mutable',
                  value: tx.mosaicProperties.supplyMutable,
                },
                {
                  key: 'Transferable',
                  value: tx.mosaicProperties.transferable,
                },
            );

            mainProps.push(
              {
                key: 'Mosaic Id: ', value: tx.mosaicId.toHex().toLowerCase(),
              },
              {
                key: 'Divisibility (decimals): ',
                value: tx.mosaicProperties.divisibility,
              },
              {
                key: 'Duration (blocks): ',
                value: (tx.mosaicProperties.duration === undefined
                  || tx.mosaicProperties.duration.compact() === 0)
                    ? 'unlimited'
                    : tx.mosaicProperties.duration.compact().toLocaleString(),
              },
            );

            break;

        case TransactionType.MOSAIC_SUPPLY_CHANGE:
            body.push(
                { key: 'Mosaic Id', value: tx.mosaicId.toHex().toLowerCase() },
                {
                  key: 'Direction',
                  value: tx.direction === 0 ? 'Decrease' : 'Increase',
                },
                {
                  key: 'Delta',
                  value: tx.delta.compact().toLocaleString(),
                },
            );

            mainProps.push(
              {
                key: 'Mosaic Id: ', value: tx.mosaicId.toHex().toLowerCase(),
              },
              {
                key: tx.direction === 0
                  ? 'Decreased by '
                  : 'Increased by ',
                value: tx.delta.compact().toLocaleString(),
              },
            );

            break;

        case TransactionType.MODIFY_MULTISIG_ACCOUNT:
            body.push(
              { key: 'Min. approval delta', value: tx.minApprovalDelta },
              { key: 'Min. removal delta', value: tx.minRemovalDelta },
            );

            mainProps.push(
              { key: 'Min. approval delta: ', value: tx.minApprovalDelta },
              { key: 'Min. removal delta: ', value: tx.minRemovalDelta },
            );

            break;

        // The aggregate types shall be unreachable.
        // I let them here for consistency with the SDK type definition file
        case TransactionType.AGGREGATE_COMPLETE: break;
        case TransactionType.AGGREGATE_BONDED: break;

        case TransactionType.LOCK:
            body.push(
              { key: 'Locked amount', value: tx.mosaic.amount.compact().toLocaleString() },
              { key: 'Locked asset Id', value: tx.mosaic.id.toHex() },
              {
                key: 'Duration (blocks)',
                value: tx.duration.compact().toLocaleString(),
              },
            );

            mainProps.push(
              { key: 'Locked amount: ', value: tx.mosaic.amount.compact().toLocaleString() },
              { key: 'Locked asset Id: ', value: tx.mosaic.id.toHex() },
              {
                key: 'Duration (blocks): ',
                value: tx.duration.compact().toLocaleString(),
              },
            );

            break;

        case TransactionType.SECRET_LOCK:
            body.push(
              { key: 'Locked amount', value: tx.mosaic.amount.compact().toLocaleString() },
              { key: 'Locked asset Id', value: tx.mosaic.id.toHex() },
              {
                key: 'Duration (blocks)',
                value: tx.duration.compact(),
              },
              { key: 'Secret', value: tx.secret },
            );

            mainProps.push(
              { key: 'Locked amount: ', value: tx.mosaic.amount.compact().toLocaleString() },
              { key: 'Locked asset Id: ', value: tx.mosaic.id.toHex() },
              {
                key: 'Duration (blocks): ',
                value: tx.duration.compact(),
              },
              { key: 'Secret: ', value: `${tx.secret.substring(0, 20)}...` },
            );

            break;

        case TransactionType.SECRET_PROOF:
            body.push(
              { key: 'Secret', value: tx.secret },
              { key: 'Proof', value: tx.proof },
            );

            mainProps.push(
              { key: 'Secret: ', value: `${tx.secret.substring(0, 20)}...` },
              { key: 'Proof: ', value: `${tx.proof.substring(0, 20)}...` },
            );

            break;

        // @TODO
        case TransactionType.MODIFY_ACCOUNT_PROPERTY_ADDRESS:
            break;

        // @TODO
        case TransactionType.MODIFY_ACCOUNT_PROPERTY_MOSAIC:
            break;

        // @TODO
        case TransactionType.MODIFY_ACCOUNT_PROPERTY_ENTITY_TYPE:
            break;

        case TransactionType.LINK_ACCOUNT:
            body.push(
              { key: 'Remote account key', value: tx.remoteAccountKey },
              { key: 'Link action', value: tx.actionType === 0 ? 'Link' : 'Unlink' },
            );

            mainProps.push(
              { key: 'Remote account key: ', value: tx.remoteAccountKey },
              { key: 'Link action: ', value: tx.actionType === 0 ? 'Link' : 'Unlink' },
            );

            break;

        default: break;
    }

    const headerExtension = {
        type1: txTypeNameFromTypeId(tx.type),
        mainProps,
    };

      resolve({ body, headerExtension });
    } catch (error) {
      reject(error);
    }
  });

const tinyAddress = address =>
  // eslint-disable-next-line implicit-arrow-linebreak
  `${address.substring(0, 13).toLowerCase()}...${address.substring(42).toLowerCase()}`;

const formatTransaction = (
  tx, namedAssets,
) => new Promise(async (resolve, reject) => {
    try {
      const signer = new Address(tx.signer.address.address).pretty();
      const signerTiny = tinyAddress(signer);
      const recipient = tx.recipient ? new Address(tx.recipient.address).pretty() : '';
      const recipientTiny = recipient === '' ? '' : tinyAddress(recipient);
      const type2 = tx.aggregate ? tx.aggregate : '';
      const { body, headerExtension } = await getBody(tx, namedAssets);
      const { type1, mainProps } = headerExtension;
      const numberOfAssetsInTransfer = type1 === 'Transfer' ? tx.mosaics.length : null;

      resolve({
        signer,
        signerTiny,
        recipient,
        recipientTiny,
        fee: tx.maxFee.compact(),
        blockNumber: tx.transactionInfo.height.compact(),
        type2,
        transactionHash: tx.transactionInfo.hash,
        id: tx.transactionInfo.id,
        body,
        type1,
        mainProps,
        numberOfAssetsInTransfer,
        deadline: formatDate(new Date(tx.deadline.value)),
        timestamp: tx.timestamp,
        date: formatDate(new Date(tx.timestamp * 1000)),
      });
    } catch (error) {
      reject(error);
    }
  });

export const formatTransactions = (
  transactions, namedAssets,
) => new Promise(async (resolve, reject) => {
  try {
    const formatted = await Promise.all(transactions.map(tx => new Promise(async (res, rej) => {
        try {
          if (tx.innerTransactions) {
            const formattedTransactionsPromises = tx.innerTransactions.map((t) => {
                if (!t.transactionInfo) t.transactionInfo = {};
                t.transactionInfo.hash = tx.transactionInfo.hash;
                t.transactionInfo.height = tx.transactionInfo.height;
                t.timestamp = tx.timestamp;

                t.aggregate = txTypeNameFromTypeId(
                  tx.type,
                  tx.innerTransactions.length,
                );
                // @TODO add a numberOfTransactionsInAggregate property
                return formatTransaction(t, namedAssets);
            });

            res(await Promise.all(formattedTransactionsPromises));
          } else {
            res([await formatTransaction(tx, namedAssets)]);
          }
        } catch (error) {
          rej(error);
        }
        })));
    resolve(Array.prototype.concat.apply([], formatted));
  } catch (error) {
    reject(error);
  }
});

export const removeDuplicatesAndSortByBlockNumber = (array) => {
    const noDuplicate = array.filter((item, index, self) => index === self.findIndex(t => (
        t.place === array.place && t.id === item.id
    )));
    return noDuplicate.sort((a, b) => b.blockNumber - a.blockNumber);
};
