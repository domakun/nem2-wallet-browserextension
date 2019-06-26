import { NamespaceType } from 'nem2-sdk';

/* eslint-disable import/prefer-default-export */
export const validateNamespaceName = (str, type) => {
  if (type === NamespaceType.RootNamespace) return RegExp('^[a-z0-9-_]{1,64}$').test(str);
  return RegExp('^[a-z0-9-_.]{1,64}$').test(str);
};
