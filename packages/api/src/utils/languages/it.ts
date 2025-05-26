import type { TranslationType } from './en';

export const it: TranslationType = {
  account: {
    mutation: {
      create: {
        errors: {
          sameNameUsed: "Un account con questo nome esiste già",
        },
      },
    },
    errors: {
      notFound: "Account non trovato",
      cannotDeleteDefault: "Impossibile eliminare l'account predefinito",
      cannotDeleteWithTransactions: "Impossibile eliminare un account con transazioni",
    }
  },
  transaction: {
    errors: {
      notFound: "Transazione non trovata",
      accountNotFound: "Account non trovato",
      cannotUpdateTransferAmount: "Impossibile aggiornare direttamente l'importo di una transazione di trasferimento",
    }
  },
  goal: {
    errors: {
      notFound: "Obiettivo non trovato",
    }
  },
  common: {
    errors: {
      notAuthenticated: "Non autenticato",
      notAuthorized: "Non autorizzato",
      serverError: "Errore interno del server",
      validationError: "Errore di validazione",
      badRequest: "Richiesta non valida",
    }
  },
  category: {
    errors: {
      notFound: "Categoria non trovata",
      incorrectType: "Tipo di categoria errato",
    }
  },
  recurringRule: {
    errors: {
      notFound: "Regola di transazione ricorrente non trovata",
      installmentRequirements: "Le rate richiedono una data di fine o un numero totale di occorrenze",
    }
  }
}; 