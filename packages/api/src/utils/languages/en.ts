// Define the structure of our translations
export interface TranslationType {
  account: {
    mutation: {
      create: {
        errors: {
          sameNameUsed: string;
        }
      }
    },
    errors: {
      notFound: string;
      cannotDeleteDefault: string;
      cannotDeleteWithTransactions: string;
    }
  },
  transaction: {
    errors: {
      notFound: string;
      accountNotFound: string;
      cannotUpdateTransferAmount: string;
    }
  },
  goal: {
    errors: {
      notFound: string;
    }
  },
  common: {
    errors: {
      notAuthenticated: string;
      notAuthorized: string;
      serverError: string;
      validationError: string;
      badRequest: string;
    }
  },
  category: {
    errors: {
      notFound: string;
      incorrectType: string;
    }
  },
  recurringRule: {
    errors: {
      notFound: string;
      installmentRequirements: string;
    }
  }
}

export const en: TranslationType = {
  account: {
    mutation: {
      create: {
        errors: {
          sameNameUsed: "An account with this name already exists",
        },
      },
    },
    errors: {
      notFound: "Account not found",
      cannotDeleteDefault: "Cannot delete the default account",
      cannotDeleteWithTransactions: "Cannot delete an account with transactions",
    }
  },
  transaction: {
    errors: {
      notFound: "Transaction not found",
      accountNotFound: "Account not found",
      cannotUpdateTransferAmount: "Cannot update amount of a transfer transaction directly",
    }
  },
  goal: {
    errors: {
      notFound: "Goal not found",
    }
  },
  common: {
    errors: {
      notAuthenticated: "Not authenticated",
      notAuthorized: "Not authorized",
      serverError: "Internal server error",
      validationError: "Validation error",
      badRequest: "Bad request",
    }
  },
  category: {
    errors: {
      notFound: "Category not found",
      incorrectType: "Incorrect category type",
    }
  },
  recurringRule: {
    errors: {
      notFound: "Recurring transaction rule not found",
      installmentRequirements: "Installments require either an end date or total occurrences",
    }
  }
};

export type Translations = typeof en;