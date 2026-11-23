import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';

import type {
  ArticleCustomizationGroup,
  ArticleCustomizationOption,
} from './entities/article.entity.js';

import {
  isNonEmptyString,
  isNonNegativeInteger,
  isRecord,
} from './common/validation.js';

function validateOptions(
  options: unknown,
  groupName: string,
  maxSelections: number,
): ArticleCustomizationOption[] {
  if (!Array.isArray(options) || (maxSelections > 0 && options.length === 0)) {
    throw rpcError(
      status.INVALID_ARGUMENT,
      `Les options du groupe "${groupName}" sont invalides.`,
    );
  }

  const ids = new Set<string>();

  return options.map((option, index) => {
    if (!isRecord(option)) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `L'option ${index + 1} du groupe "${groupName}" est invalide.`,
      );
    }

    const { id, name, additionalPrice } = option;
    const invalidIdentity =
      !isNonEmptyString(id) || ids.has(id) || !isNonEmptyString(name);
    const invalidPrice =
      typeof additionalPrice !== 'number' ||
      !Number.isFinite(additionalPrice) ||
      additionalPrice < 0;
    if (invalidIdentity || invalidPrice) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Les données de l'option ${index + 1} du groupe "${groupName}" sont invalides.`,
      );
    }

    ids.add(id);

    return { id, name, additionalPrice };
  });
}

export function validateArticleCustomizations(
  value: unknown,
): ArticleCustomizationGroup[] {
  if (!Array.isArray(value)) {
    throw rpcError(
      status.INVALID_ARGUMENT,
      'Les personnalisations doivent être une liste.',
    );
  }

  const ids = new Set<string>();

  return value.map((group, index) => {
    if (!isRecord(group)) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Le groupe ${index + 1} est invalide.`,
      );
    }

    const {
      id,
      name,
      minSelections,
      maxSelections,
      includedSelections,
      options,
    } = group;
    if (!isNonEmptyString(id) || ids.has(id) || !isNonEmptyString(name)) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `L'identité du groupe ${index + 1} est invalide.`,
      );
    }

    const validQuantities =
      isNonNegativeInteger(minSelections) &&
      isNonNegativeInteger(maxSelections) &&
      isNonNegativeInteger(includedSelections);
    if (
      !validQuantities ||
      minSelections > maxSelections ||
      includedSelections > maxSelections
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Les contraintes du groupe de personnalisation "${name}" sont invalides.`,
      );
    }

    ids.add(id);

    return {
      id,
      name,
      minSelections,
      maxSelections,
      includedSelections,
      options: validateOptions(options, name, maxSelections),
    };
  });
}
