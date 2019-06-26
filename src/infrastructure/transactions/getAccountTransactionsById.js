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
  AccountHttp, QueryParams, BlockHttp,
} from 'nem2-sdk';
import {
  toArray, flatMap, concatMap, groupBy,
} from 'rxjs/operators';
import {
  zip, of,
} from 'rxjs';

import { timestampNemesisBlock } from '../network/types';

const getAccountTransactionsById = (
  { wallet, currentId, activeNode },
) => new Promise(async (resolve, reject) => {
  try {
    const accountHttp = new AccountHttp(activeNode);
    const blockHttp = new BlockHttp(activeNode);
    const pageSize = 10;
    const { publicAccount } = wallet;

    accountHttp
      .transactions(publicAccount, new QueryParams(pageSize, currentId))
      .pipe(
        flatMap(x => x),
        groupBy(x => x.transactionInfo.height.compact()),
        flatMap(g => zip(of(g.key), g.pipe(toArray()))),
        concatMap(g => blockHttp.getBlockByHeight(g[0]).toPromise(),
          (g, res) => g[1].map(t => (
            { ...t, timestamp: res.timestamp.compact() / 1000 + timestampNemesisBlock }
          ))),
        flatMap(x => x),
        toArray(),
      )
      .subscribe(
        tx => resolve(tx),
        // eslint-disable-next-line no-console
        (error) => { console.error(error); resolve(false); },
      );
  } catch (error) {
    reject(error);
  }
});

export default getAccountTransactionsById;
