import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';

import type {
  ArticleCustomizationGroup,
  ArticleCustomizationOption,
} from '../entities/article.entity.js';

import {
  isNonEmptyString,
  isNonNegativeInteger,
  isRecord,
} from '../../../core/common/validation.js';

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

    const { id, name, additionalPrice, incompatibleWith } = option;
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

    if (incompatibleWith === undefined) {
      return { id, name, additionalPrice };
    }

    if (!Array.isArray(incompatibleWith)) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Incompatibilités invalides pour "${name}".`,
      );
    }
    const references = incompatibleWith.map((reference) => {
      if (
        !isRecord(reference) ||
        !isNonEmptyString(reference.groupId) ||
        !isNonEmptyString(reference.optionId)
      ) {
        throw rpcError(
          status.INVALID_ARGUMENT,
          `Incompatibilité invalide pour "${name}".`,
        );
      }

      return { groupId: reference.groupId, optionId: reference.optionId };
    });

    return { id, name, additionalPrice, incompatibleWith: references };
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

  const groups = value.map((group, index) => {
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

  for (const group of groups) {
    for (const option of group.options) {
      for (const reference of option.incompatibleWith ?? []) {
        const target = groups.find(
          (candidate) => candidate.id === reference.groupId,
        );
        if (
          !target?.options.some(
            (candidate) => candidate.id === reference.optionId,
          ) ||
          (group.id === reference.groupId && option.id === reference.optionId)
        ) {
          throw rpcError(
            status.INVALID_ARGUMENT,
            `Incompatibilité inconnue pour "${option.name}".`,
          );
        }
      }
    }
  }

  return groups;
}
