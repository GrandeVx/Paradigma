// prisma/seed.ts
import { PrismaClient, CategoryType, FrequencyType, RuleType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log(`Inizio seeding ...`);

  // --- 0. OTTIENI O CREA L'UTENTE PRINCIPALE ---
  const mainUserEmail = 'grandevx@gmail.com';
  let mainUser = await prisma.user.findUnique({
    where: { email: mainUserEmail },
  });

  if (!mainUser) {
    mainUser = await prisma.user.create({
      data: {
        email: mainUserEmail,
        name: 'Grande VX',
        username: 'grandevx',
        emailVerified: true,
      },
    });
    console.log(`Creato utente principale: ${mainUser.name} (ID: ${mainUser.id}) con email ${mainUser.email}`);
  } else {
    console.log(`Utente principale trovato: ${mainUser.name} (ID: ${mainUser.id}) con email ${mainUser.email}`);
  }

  // --- 0.1 OTTIENI L'ACCOUNT DI AUTENTICAZIONE DELL'UTENTE ---
  // Questo accountId è necessario per Transaction e RecurringTransactionRule
  const userAuthAccount = await prisma.account.findFirst({
    where: { userId: mainUser.id },
  });

  if (!userAuthAccount) {
    console.error(`ERRORE CRITICO: Nessun record 'Account' (Better Auth) trovato per l'utente ${mainUser.email} (ID: ${mainUser.id}).`);
    console.error(`Questo 'accountId' è obbligatorio per i record 'Transaction' e 'RecurringTransactionRule'.`);
    console.error(`Assicurati che un record 'Account' esista per questo utente o modifica lo schema per rendere 'Transaction.accountId' e 'RecurringTransactionRule.accountId' opzionali se applicabile.`);
    throw new Error(`Account di autenticazione non trovato per l'utente ${mainUser.id}. Impossibile procedere con il seeding completo.`);
  }
  const requiredAuthAccountId = userAuthAccount.id;
  console.log(`Trovato Account (Better Auth) ID: ${requiredAuthAccountId} per l'utente ${mainUser.email}`);


  // --- PULIZIA DATI FINANZIARI ESISTENTI PER L'UTENTE ---
  console.log(`Inizio pulizia dati finanziari esistenti per l'utente ${mainUser.email}...`);
  await prisma.transaction.deleteMany({ where: { userId: mainUser.id } });
  console.log(`- Transazioni eliminate per l'utente.`);
  await prisma.recurringTransactionRule.deleteMany({ where: { userId: mainUser.id } });
  console.log(`- Regole ricorrenti eliminate per l'utente.`);
  await prisma.budget.deleteMany({ where: { userId: mainUser.id } });
  console.log(`- Budget eliminati per l'utente.`);
  await prisma.goal.deleteMany({ where: { userId: mainUser.id } });
  console.log(`- Obiettivi eliminati per l'utente.`);
  await prisma.moneyAccount.deleteMany({ where: { userId: mainUser.id } });
  console.log(`- Conti finanziari (MoneyAccount) eliminati per l'utente.`);
  
  // Elimina anche le sottocategorie esistenti per evitare duplicati
  const existingMacroCategories = await prisma.macroCategory.findMany();
  for (const macro of existingMacroCategories) {
    await prisma.subCategory.deleteMany({ where: { macroCategoryId: macro.id } });
  }
  console.log(`- Sottocategorie eliminate per tutte le macrocategorie.`);
  
  console.log(`Pulizia dati finanziari esistenti completata.`);


  // --- 1. MACRO CATEGORIE E SOTTO-CATEGORIE (Predefinite per MVP con Emoticon) ---
  const casaMacro = await prisma.macroCategory.upsert({
    where: { name: 'Casa' },
    update: { 
      icon: '🏠', 
      color: '#FFB6C1',
      subCategories: {
        create: [
          { name: 'Affitto', icon: '🔑' }, { name: 'Arredamento', icon: '🛋️' },
          { name: 'Internet', icon: '🌐' }, { name: 'Spese condominiali', icon: '🏢' },
          { name: 'Utenze', icon: '💡' }, { name: 'Riparazioni', icon: '🛠️' },
        ],
      },
    },
    create: {
      name: 'Casa', type: CategoryType.EXPENSE, color: '#FFB6C1', icon: '🏠',
      subCategories: {
        create: [
          { name: 'Affitto', icon: '🔑' }, { name: 'Arredamento', icon: '🛋️' },
          { name: 'Internet', icon: '🌐' }, { name: 'Spese condominiali', icon: '🏢' },
          { name: 'Utenze', icon: '💡' }, { name: 'Riparazioni', icon: '🛠️' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${casaMacro.name}' (${casaMacro.icon}) con ${casaMacro.subCategories.length} sotto-categorie.`);

  const ciboBevandeMacro = await prisma.macroCategory.upsert({
    where: { name: 'Cibo & Bevande' },
    update: { 
      icon: '🍔', 
      color: '#90EE90',
      subCategories: {
        create: [
          { name: 'Bar & Caffè', icon: '☕' }, { name: 'Delivery', icon: '🛵' },
          { name: 'Spesa', icon: '🛒' }, { name: 'Ristoranti', icon: '🍽️' },
          { name: 'Take Away', icon: '🥡' },
        ],
      },
    },
    create: {
      name: 'Cibo & Bevande', type: CategoryType.EXPENSE, color: '#90EE90', icon: '🍔',
      subCategories: {
        create: [
          { name: 'Bar & Caffè', icon: '☕' }, { name: 'Delivery', icon: '🛵' },
          { name: 'Spesa', icon: '🛒' }, { name: 'Ristoranti', icon: '🍽️' },
          { name: 'Take Away', icon: '🥡' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${ciboBevandeMacro.name}' (${ciboBevandeMacro.icon}) con ${ciboBevandeMacro.subCategories.length} sotto-categorie.`);

  const benessereMacro = await prisma.macroCategory.upsert({
    where: { name: 'Benessere' },
    update: { 
      icon: '💪', 
      color: '#FFDEAD',
      subCategories: {
        create: [
          { name: 'Abbigliamento', icon: '👕' }, { name: 'Bellezza', icon: '💅' },
          { name: 'Farmaci', icon: '💊' }, { name: 'Giochi', icon: '🎮' },
          { name: 'Hotel', icon: '🏨' }, { name: 'Regali', icon: '🎁' },
          { name: 'Salute', icon: '❤️‍🩹' }, { name: 'Tecnologia', icon: '💻' },
        ],
      },
    },
    create: {
      name: 'Benessere', type: CategoryType.EXPENSE, color: '#FFDEAD', icon: '💪',
      subCategories: {
        create: [
          { name: 'Abbigliamento', icon: '👕' }, { name: 'Bellezza', icon: '💅' },
          { name: 'Farmaci', icon: '💊' }, { name: 'Giochi', icon: '🎮' },
          { name: 'Hotel', icon: '🏨' }, { name: 'Regali', icon: '🎁' },
          { name: 'Salute', icon: '❤️‍🩹' }, { name: 'Tecnologia', icon: '💻' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${benessereMacro.name}' (${benessereMacro.icon}) con ${benessereMacro.subCategories.length} sotto-categorie.`);

  const finanzeSpeseMacro = await prisma.macroCategory.upsert({
    where: { name: 'Finanze (Uscite)' },
    update: { 
      icon: '💸', 
      color: '#ADD8E6',
      subCategories: {
        create: [
          { name: 'Costi bancari', icon: '🏦' }, { name: 'Finanziamenti', icon: '📄' },
          { name: 'Investimenti (Uscita)', icon: '📉' }, { name: 'Mutuo', icon: '🏡' },
          { name: 'Risparmi (Versamento)', icon: '🐖' },
        ],
      },
    },
    create: {
      name: 'Finanze (Uscite)', type: CategoryType.EXPENSE, color: '#ADD8E6', icon: '💸',
      subCategories: {
        create: [
          { name: 'Costi bancari', icon: '🏦' }, { name: 'Finanziamenti', icon: '📄' },
          { name: 'Investimenti (Uscita)', icon: '📉' }, { name: 'Mutuo', icon: '🏡' },
          { name: 'Risparmi (Versamento)', icon: '🐖' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${finanzeSpeseMacro.name}' (${finanzeSpeseMacro.icon}) con ${finanzeSpeseMacro.subCategories.length} sotto-categorie.`);

  const intrattenimentoMacro = await prisma.macroCategory.upsert({
    where: { name: 'Intrattenimento' },
    update: { 
      icon: '🎉', 
      color: '#DA70D6',
      subCategories: {
        create: [
          { name: 'Abbonamenti', icon: '📺' }, { name: 'Cinema', icon: '🎬' },
          { name: 'Eventi', icon: '🎟️' }, { name: 'Hobby', icon: '🎨' },
          { name: 'Istruzione', icon: '📚' }, { name: 'Vita notturna', icon: '🌃' },
        ],
      },
    },
    create: {
      name: 'Intrattenimento', type: CategoryType.EXPENSE, color: '#DA70D6', icon: '🎉',
      subCategories: {
        create: [
          { name: 'Abbonamenti', icon: '📺' }, { name: 'Cinema', icon: '🎬' },
          { name: 'Eventi', icon: '🎟️' }, { name: 'Hobby', icon: '🎨' },
          { name: 'Istruzione', icon: '📚' }, { name: 'Vita notturna', icon: '🌃' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${intrattenimentoMacro.name}' (${intrattenimentoMacro.icon}) con ${intrattenimentoMacro.subCategories.length} sotto-categorie.`);

  const trasportiMacro = await prisma.macroCategory.upsert({
    where: { name: 'Trasporti' },
    update: { 
      icon: '🚗', 
      color: '#A9A9A9',
      subCategories: {
        create: [
          { name: 'Assicurazione', icon: '🛡️' }, { name: 'Carburante', icon: '⛽' },
          { name: 'Manutenzione Veicolo', icon: '🔧' }, { name: 'Parcheggi', icon: '🅿️' },
          { name: 'Pedaggi', icon: '🛣️' }, { name: 'Taxi', icon: '🚕' },
          { name: 'Trasporto pubblico', icon: '🚌' }, { name: 'Voli', icon: '✈️' },
        ],
      },
    },
    create: {
      name: 'Trasporti', type: CategoryType.EXPENSE, color: '#A9A9A9', icon: '🚗',
      subCategories: {
        create: [
          { name: 'Assicurazione', icon: '🛡️' }, { name: 'Carburante', icon: '⛽' },
          { name: 'Manutenzione Veicolo', icon: '🔧' }, { name: 'Parcheggi', icon: '🅿️' },
          { name: 'Pedaggi', icon: '🛣️' }, { name: 'Taxi', icon: '🚕' },
          { name: 'Trasporto pubblico', icon: '🚌' }, { name: 'Voli', icon: '✈️' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${trasportiMacro.name}' (${trasportiMacro.icon}) con ${trasportiMacro.subCategories.length} sotto-categorie.`);

  const stipendioMacro = await prisma.macroCategory.upsert({
    where: { name: 'Stipendio & Lavoro' },
    update: { 
      icon: '💼', 
      color: '#FFD700',
      subCategories: {
        create: [
          { name: 'Salario Mensile', icon: '💵' }, { name: 'Bonus', icon: '⭐' },
          { name: 'Lavoro Autonomo', icon: '🧑‍💻' },
        ],
      },
    },
    create: {
      name: 'Stipendio & Lavoro', type: CategoryType.INCOME, color: '#FFD700', icon: '💼',
      subCategories: {
        create: [
          { name: 'Salario Mensile', icon: '💵' }, { name: 'Bonus', icon: '⭐' },
          { name: 'Lavoro Autonomo', icon: '🧑‍💻' },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${stipendioMacro.name}' (${stipendioMacro.icon}) con ${stipendioMacro.subCategories.length} sotto-categorie.`);

  const entrateExtraMacro = await prisma.macroCategory.upsert({
    where: { name: 'Entrate Extra' },
    update: { 
      icon: '✨', 
      color: '#32CD32',
      subCategories: {
        create: [
          { name: 'Vendite Online', icon: '📦' }, { name: 'Rimborsi', icon: '↩️' },
          { name: 'Regali Ricevuti', icon: '🎀' }, { name: 'Interessi Attivi', icon: '📈'},
        ],
      },
    },
    create: {
      name: 'Entrate Extra', type: CategoryType.INCOME, color: '#32CD32', icon: '✨',
      subCategories: {
        create: [
          { name: 'Vendite Online', icon: '📦' }, { name: 'Rimborsi', icon: '↩️' },
          { name: 'Regali Ricevuti', icon: '🎀' }, { name: 'Interessi Attivi', icon: '📈'},
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`Creata/Aggiornata MacroCategoria '${entrateExtraMacro.name}' (${entrateExtraMacro.icon}) con ${entrateExtraMacro.subCategories.length} sotto-categorie.`);

  // --- 2. CONTI FINANZIARI (MoneyAccount) PER L'UTENTE ---
  const contoCorrente = await prisma.moneyAccount.create({
    data: {
      userId: mainUser.id, name: 'Conto Corrente Principale', iconName: '🏦',
      color: '#4A90E2', default: true, currency: 'EUR', initialBalance: new Decimal(1500.75),
    },
  });
  console.log(`Creato MoneyAccount: ${contoCorrente.name}`);

  const cartaCredito = await prisma.moneyAccount.create({
    data: {
      userId: mainUser.id, name: 'Carta di Credito Oro', iconName: '💳',
      color: '#F5A623', default: false, currency: 'EUR', initialBalance: new Decimal(0),
    },
  });
  console.log(`Creato MoneyAccount: ${cartaCredito.name}`);

  const contoRisparmioObiettivo = await prisma.moneyAccount.create({
    data: {
      userId: mainUser.id, name: 'Risparmi Viaggio Giappone', iconName: '✈️',
      color: '#7ED321', default: false, currency: 'EUR', initialBalance: new Decimal(100.00),
    }
  });
  console.log(`Creato MoneyAccount risparmio: ${contoRisparmioObiettivo.name}`);

  // --- 3. OBIETTIVO DI RISPARMIO ---
  const obiettivoGiappone = await prisma.goal.create({
    data: {
      userId: mainUser.id, name: 'Viaggio in Giappone 2026', iconName: '🇯🇵',
      color: '#BD10E0', targetAmount: new Decimal(3500.00),
      targetDate: new Date('2026-07-01'), description: 'Risparmi per il grande viaggio!',
    }
  });
  console.log(`Creato obiettivo: ${obiettivoGiappone.name}`);

  // --- 4. TRANSAZIONI DI ESEMPIO ---
  const subAffitto = casaMacro.subCategories.find(sc => sc.name === 'Affitto');
  const subSpesa = ciboBevandeMacro.subCategories.find(sc => sc.name === 'Spesa');
  const subSalario = stipendioMacro.subCategories.find(sc => sc.name === 'Salario Mensile');
  const subAbbonamenti = intrattenimentoMacro.subCategories.find(sc => sc.name === 'Abbonamenti');
  const subCarburante = trasportiMacro.subCategories.find(sc => sc.name === 'Carburante');

  if (subAffitto && subSpesa && subSalario && subAbbonamenti && subCarburante) {
    await prisma.transaction.createMany({
      data: [
        { moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Stipendio Maggio', amount: new Decimal(2250.00), currency: 'EUR', date: new Date('2025-05-28T10:00:00Z'), subCategoryId: subSalario.id },
        { moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Affitto Giugno', amount: new Decimal(-750.00), currency: 'EUR', date: new Date('2025-06-01T09:00:00Z'), subCategoryId: subAffitto.id },
        { moneyAccountId: cartaCredito.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Spesa Esselunga', amount: new Decimal(-85.50), currency: 'EUR', date: new Date('2025-06-03T17:30:00Z'), subCategoryId: subSpesa.id },
        { moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Abbonamento Netflix', amount: new Decimal(-15.99), currency: 'EUR', date: new Date('2025-06-05T12:00:00Z'), subCategoryId: subAbbonamenti.id },
        { moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Pieno Benzina', amount: new Decimal(-70.00), currency: 'EUR', date: new Date('2025-06-06T08:00:00Z'), subCategoryId: subCarburante.id },
        { moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Trasferimento a Risparmi Giappone', amount: new Decimal(-200.00), currency: 'EUR', date: new Date('2025-06-07T11:00:00Z'), transferId: 'transfer_seed_jap_1', goalId: obiettivoGiappone.id },
        { moneyAccountId: contoRisparmioObiettivo.id, accountId: requiredAuthAccountId, userId: mainUser.id, description: 'Trasferimento da Conto Corrente', amount: new Decimal(200.00), currency: 'EUR', date: new Date('2025-06-07T11:00:00Z'), transferId: 'transfer_seed_jap_1', goalId: obiettivoGiappone.id },
      ],
    });
    console.log(`Create transazioni di esempio.`);
  } else {
      console.warn("Alcune sotto-categorie non trovate, transazioni di esempio non create completamente.");
  }

  // --- 5. BUDGET DI ESEMPIO (Impostazione fissa) ---
  if (ciboBevandeMacro && casaMacro && trasportiMacro) {
    await prisma.budget.create({ data: { userId: mainUser.id, macroCategoryId: ciboBevandeMacro.id, allocatedAmount: new Decimal(350.00) } });
    await prisma.budget.create({ data: { userId: mainUser.id, macroCategoryId: casaMacro.id, allocatedAmount: new Decimal(950.00) } });
    await prisma.budget.create({ data: { userId: mainUser.id, macroCategoryId: trasportiMacro.id, allocatedAmount: new Decimal(150.00) } });
    console.log(`Impostati budget per 'Cibo & Bevande', 'Casa' e 'Trasporti'.`);
  }

  // --- 6. REGOLA RICORRENTE DI ESEMPIO (Rata e Ricorrente) ---
  const subFinanziamento = finanzeSpeseMacro.subCategories.find(sc => sc.name === 'Finanziamenti');
  const subAbbonamentiIntrattenimento = intrattenimentoMacro.subCategories.find(sc => sc.name === 'Abbonamenti');

  if (subFinanziamento && contoCorrente) {
    await prisma.recurringTransactionRule.create({
        data: {
            userId: mainUser.id, moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, description: 'Rata Finanziamento Auto',
            amount: new Decimal(-250.00), currency: 'EUR', type: RuleType.EXPENSE, subCategoryId: subFinanziamento.id,
            startDate: new Date('2025-06-15T08:00:00Z'), frequencyType: FrequencyType.MONTHLY, frequencyInterval: 1,
            dayOfMonth: 15, nextDueDate: new Date('2025-06-15T08:00:00Z'),
            isInstallment: true, totalOccurrences: 24, isActive: true,
        }
    });
    console.log(`Creata regola rata 'Finanziamento Auto'.`);
  }
  if (subAbbonamentiIntrattenimento && contoCorrente) {
      await prisma.recurringTransactionRule.create({
          data: {
              userId: mainUser.id, moneyAccountId: contoCorrente.id, accountId: requiredAuthAccountId, description: 'Abbonamento Palestra',
              amount: new Decimal(-45.00), currency: 'EUR', type: RuleType.EXPENSE, subCategoryId: subAbbonamentiIntrattenimento.id,
              startDate: new Date('2025-06-01T08:00:00Z'), frequencyType: FrequencyType.MONTHLY, frequencyInterval: 1,
              dayOfMonth: 1, nextDueDate: new Date('2025-06-01T08:00:00Z'),
              isInstallment: false, isActive: true,
          }
      });
      console.log(`Creata regola ricorrente 'Abbonamento Palestra'.`);
  }

  console.log(`Seeding completato.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
