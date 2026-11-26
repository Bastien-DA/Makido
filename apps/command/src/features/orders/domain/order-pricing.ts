import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';

import type {
  Article,
  ArticleCustomizationOption,
} from '../../articles/entities/article.entity.js';
import type { OrderLine } from '../entities/order.entity.js';

import { isRecord } from '../../../core/common/validation.js';

export interface SelectedOption {
  groupId: string;
  optionId: string;
  quantity: number;
  includedQuantity: number;
}

export interface RequestedLine {
  articleId: string;
  quantity: number;
  customizations: SelectedOption[];
}

function cents(price: number): number {
  const value = Math.round(price * 100);
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    Math.abs(price * 100 - value) > 0.000001
  ) {
    throw rpcError(
      status.FAILED_PRECONDITION,
      'Prix invalide dans le catalogue.',
    );
  }

  return value;
}

export function priceLine(
  article: Article,
  line: RequestedLine,
): { totalCents: number; snapshot: OrderLine } {
  if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
    throw rpcError(status.INVALID_ARGUMENT, "Quantité d'article invalide.");
  }
  if (!article.isAvailable || article.ingredients.length === 0) {
    throw rpcError(
      status.FAILED_PRECONDITION,
      `Article indisponible ou sans ingrédients : ${article.name}.`,
    );
  }

  const selected = new Map<
    string,
    {
      selection: SelectedOption;
      option: ArticleCustomizationOption;
      groupName: string;
    }
  >();
  const totalByGroup = new Map<string, number>();
  const includedByGroup = new Map<string, number>();
  let unitCents = cents(article.price);

  for (const selection of line.customizations) {
    if (
      !isRecord(selection) ||
      typeof selection.groupId !== 'string' ||
      typeof selection.optionId !== 'string'
    ) {
      throw rpcError(status.INVALID_ARGUMENT, "Personnalisation invalide.");
    }
    const group = article.customizations.find(
      (item) => item.id === selection.groupId,
    );
    const option = group?.options.find(
      (item) => item.id === selection.optionId,
    );
    const key = JSON.stringify([selection.groupId, selection.optionId]);
    if (!group || !option || selected.has(key)) {
      throw rpcError(status.INVALID_ARGUMENT, "Option inconnue ou dupliquée.");
    }
    if (
      !Number.isSafeInteger(selection.quantity) ||
      selection.quantity < 1 ||
      !Number.isSafeInteger(selection.includedQuantity) ||
      selection.includedQuantity < 0 ||
      selection.includedQuantity > selection.quantity
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        "Quantité de personnalisation invalide.",
      );
    }
    selected.set(key, { selection, option, groupName: group.name });
    totalByGroup.set(
      group.id,
      (totalByGroup.get(group.id) ?? 0) + selection.quantity,
    );
    includedByGroup.set(
      group.id,
      (includedByGroup.get(group.id) ?? 0) + selection.includedQuantity,
    );
    unitCents +=
      (selection.quantity - selection.includedQuantity) *
      cents(option.additionalPrice);
    if (
      !Number.isSafeInteger(unitCents) ||
      !Number.isSafeInteger(totalByGroup.get(group.id)) ||
      !Number.isSafeInteger(includedByGroup.get(group.id))
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        "Quantité de personnalisation trop élevée.",
      );
    }
  }

  validateGroups(article, totalByGroup, includedByGroup);
  validateCompatibility(selected);
  const totalCents = unitCents * line.quantity;
  if (!Number.isSafeInteger(totalCents)) {
    throw rpcError(
      status.INVALID_ARGUMENT,
      'Montant de la commande trop élevé.',
    );
  }

  return {
    totalCents,
    snapshot: {
      articleId: article.id,
      name: article.name,
      quantity: line.quantity,
      ingredients: article.ingredients,
      customizations: [...selected.values()].map(
        ({ selection, option, groupName }) => ({
          groupName,
          optionName: option.name,
          quantity: selection.quantity,
          includedQuantity: selection.includedQuantity,
        }),
      ),
    },
  };
}

function validateGroups(
  article: Article,
  totalByGroup: Map<string, number>,
  includedByGroup: Map<string, number>,
): void {
  for (const group of article.customizations) {
    const total = totalByGroup.get(group.id) ?? 0;
    const included = includedByGroup.get(group.id) ?? 0;
    if (
      total < group.minSelections ||
      total > group.maxSelections ||
      included !== Math.min(total, group.includedSelections)
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Sélection invalide pour "${group.name}".`,
      );
    }
  }
}

function validateCompatibility(
  selected: Map<string, { option: ArticleCustomizationOption }>,
): void {
  for (const { option } of selected.values()) {
    for (const reference of option.incompatibleWith ?? []) {
      if (
        selected.has(JSON.stringify([reference.groupId, reference.optionId]))
      ) {
        throw rpcError(status.INVALID_ARGUMENT, "Options incompatibles.");
      }
    }
  }
}
