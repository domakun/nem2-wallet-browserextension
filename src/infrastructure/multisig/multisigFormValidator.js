import ErrorMessage from '../errorMessage/error-message';

export const multisigModifyValidator = (pointer) => {
  const {
    currentMultisigAccount, cosignatoryDeleteList, cosignatoryAddList,
    removalDelta, approvalDelta, maxFee, generationHash,
  } = pointer;
  const { multisigAccounts } = pointer.multisig.multisigInfo[pointer.wallet.activeWallet.name];
  const addAmount = cosignatoryAddList.length;
  const deleteAmount = cosignatoryDeleteList.length;
  const cosignerAmount = multisigAccounts.length;
  const removalResult = removalDelta + currentMultisigAccount.minRemoval;
  const approvalResult = approvalDelta + currentMultisigAccount.minApproval;
  const cosignerResult = addAmount + cosignerAmount - deleteAmount;
  let errorMessage = [];
  if (!currentMultisigAccount) {
    errorMessage.push(ErrorMessage.PUBLIC_KEY_NULL);
    return errorMessage;
  }
  if (removalResult <= 0) {
    errorMessage.push(ErrorMessage.REMOVAL_TOO_SMALL);
    return false;
  }
  if (approvalResult <= 0) {
    errorMessage.push(ErrorMessage.APPROVAL_TOO_SMALL);
    return false;
  }
  if (removalResult >= 10) {
    errorMessage.push(ErrorMessage.REMOVAL_TOO_BIG);
    return false;
  }
  if (approvalResult <= 0) {
    errorMessage.push(ErrorMessage.APPROVAL_TOO_BIG);
    return false;
  }
  if (Number(maxFee) < 0) {
    errorMessage.push(ErrorMessage.MAX_FEE_ERROR);
    return false;
  }
  if (!generationHash || generationHash.trim() === '') {
    errorMessage.push(ErrorMessage.GENERATION_HASH_NULL);
    return errorMessage;
  }
  if (generationHash.length !== 64) {
    errorMessage.push(ErrorMessage.GENERATION_HASH_ERROR);
    return errorMessage;
  }
  if (cosignerResult < 0) {
    errorMessage.push(ErrorMessage.TOO_LESS_COSIGNERS);
    return errorMessage;
  }
  if (cosignerResult > 10) {
    errorMessage.push(ErrorMessage.TOO_MANY_COSIGNERS);
    return errorMessage;
  }
  return errorMessage;
};

export const multisigCovertionValidator = (pointer) => {
  const {
    minApprovalDelta, minRemovalDelta, txMaxFee, generationHash, publicKeyList,
  } = pointer;
  const errorMessage = [];
  if (minApprovalDelta < 0) {
    errorMessage.push(ErrorMessage.MIN_APPROVAL_ERROR);
    return errorMessage;
  }
  if (minRemovalDelta < 0) {
    errorMessage.push(ErrorMessage.MIN_REMOVAL_ERROR);
    return errorMessage;
  }
  if (txMaxFee < 0) {
    errorMessage.push(ErrorMessage.MAX_FEE_ERROR);
    return errorMessage;
  }
  if (!generationHash || generationHash.trim() === '') {
    errorMessage.push(ErrorMessage.GENERATION_HASH_NULL);
    return errorMessage;
  }
  if (generationHash.length !== 64) {
    errorMessage.push(ErrorMessage.GENERATION_HASH_ERROR);
    return errorMessage;
  }
  if (publicKeyList.length === 0) {
    errorMessage.push(ErrorMessage.NO_COSIGNER);
    return errorMessage;
  }
  publicKeyList.every((item) => {
    if (item.trim().length !== 64) {
      errorMessage.push(ErrorMessage.PUBLIC_KEY_ERROR);
      return false;
    }
    return true;
  });
  return errorMessage;
};
