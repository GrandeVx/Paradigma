// prisma/seed-recurring-test.ts
// Seed script per testare le transazioni ricorrenti
import { PrismaClient, CategoryType, FrequencyType, RuleType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log(`🧪 Inizio seeding test ricorrenze...`);

  const testUserId = '0dMamejpicA4ZEAtRdbee3NL3XfzJlD9';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Verifica che l'utente esista
  const testUser = await prisma.user.findUnique({
    where: { id: testUserId },
  });

  if (!testUser) {
    throw new Error(`Utente con ID ${testUserId} non trovato!`);
  }

  console.log(`✅ Trovato utente test: ${testUser.name || testUser.email} (ID: ${testUser.id})`);

  // Trova il primo account di questo utente
  const userAccount = await prisma.moneyAccount.findFirst({
    where: { userId: testUserId },
  });

  if (!userAccount) {
    throw new Error(`Nessun MoneyAccount trovato per l'utente ${testUserId}`);
  }

  console.log(`✅ Trovato account: ${userAccount.name} (ID: ${userAccount.id})`);

  // Trova o crea l'account di autenticazione
  let authAccount = await prisma.account.findFirst({
    where: { userId: testUserId },
  });

  if (!authAccount) {
    console.log(`⚠️ Nessun Account di autenticazione trovato, ne creo uno per il test...`);
    authAccount = await prisma.account.create({
      data: {
        userId: testUserId,
        providerId: 'email-password',
        accountId: `test-account-${testUserId}`,
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      },
    });
    console.log(`✅ Creato auth account per test: ${authAccount.id}`);
  } else {
    console.log(`✅ Trovato auth account: ${authAccount.id}`);
  }

  // Trova alcune categorie per le transazioni
  const speseMacro = await prisma.macroCategory.findFirst({
    where: { type: CategoryType.EXPENSE },
    include: { subCategories: true },
  });

  const entrateMacro = await prisma.macroCategory.findFirst({
    where: { type: CategoryType.INCOME },
    include: { subCategories: true },
  });

  if (!speseMacro || !entrateMacro) {
    throw new Error('Categorie macro non trovate');
  }

  // Pulizia regole esistenti per l'utente test
  await prisma.recurringTransactionRule.deleteMany({
    where: { userId: testUserId },
  });
  console.log(`🧹 Pulite regole ricorrenti esistenti per l'utente test`);

  // Crea regole ricorrenti che scadono oggi
  const rulesToCreate = [
    {
      description: 'Stipendio Mensile - TEST',
      amount: new Decimal(2500.00),
      type: RuleType.INCOME,
      subCategoryId: entrateMacro.subCategories[0]?.id,
      frequencyType: FrequencyType.MONTHLY,
      frequencyInterval: 1,
      dayOfMonth: today.getDate(),
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      isInstallment: false,
      notes: 'Regola test per stipendio mensile',
    },
    {
      description: 'Affitto Casa - TEST',
      amount: new Decimal(-800.00),
      type: RuleType.EXPENSE,
      subCategoryId: speseMacro.subCategories[0]?.id,
      frequencyType: FrequencyType.MONTHLY,
      frequencyInterval: 1,
      dayOfMonth: today.getDate(),
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      isInstallment: false,
      notes: 'Regola test per affitto mensile',
    },
    {
      description: 'Rata Auto - TEST (Installment)',
      amount: new Decimal(-350.00),
      type: RuleType.EXPENSE,
      subCategoryId: speseMacro.subCategories[1]?.id || speseMacro.subCategories[0]?.id,
      frequencyType: FrequencyType.MONTHLY,
      frequencyInterval: 1,
      dayOfMonth: today.getDate(),
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      isInstallment: true,
      totalOccurrences: 36,
      occurrencesGenerated: 12, // Già generate 12 rate, ne rimangono 24
      notes: 'Regola test per rata auto (installment)',
    },
    {
      description: 'Spesa Settimanale - TEST',
      amount: new Decimal(-120.00),
      type: RuleType.EXPENSE,
      subCategoryId: speseMacro.subCategories[0]?.id,
      frequencyType: FrequencyType.WEEKLY,
      frequencyInterval: 1,
      dayOfWeek: today.getDay(),
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      isInstallment: false,
      notes: 'Regola test per spesa settimanale',
    },
    {
      description: 'Bonus Trimestrale - TEST',
      amount: new Decimal(500.00),
      type: RuleType.INCOME,
      subCategoryId: entrateMacro.subCategories[0]?.id,
      frequencyType: FrequencyType.MONTHLY,
      frequencyInterval: 3,
      dayOfMonth: today.getDate(),
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      isInstallment: false,
      notes: 'Regola test per bonus trimestrale',
    },
  ];

  console.log(`📅 Creando ${rulesToCreate.length} regole ricorrenti che scadono oggi (${today.toLocaleDateString()})...`);

  for (const [index, ruleData] of rulesToCreate.entries()) {
    const rule = await prisma.recurringTransactionRule.create({
      data: {
        userId: testUserId,
        moneyAccountId: userAccount.id,
        startDate: yesterday, // Iniziata ieri così è già attiva
        isActive: true,
        ...ruleData,
      },
    });

    console.log(`  ✅ ${index + 1}. ${rule.description} - ${rule.amount} EUR (${rule.type})`);
  }

  // Crea anche una regola scaduta ieri (per verificare che venga processata)
  const yesterdayRule = await prisma.recurringTransactionRule.create({
    data: {
      userId: testUserId,
      moneyAccountId: userAccount.id,
      description: 'Regola Scaduta Ieri - TEST',
      amount: new Decimal(-50.00),
      type: RuleType.EXPENSE,
      subCategoryId: speseMacro.subCategories[0]?.id,
      startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 1),
      frequencyType: FrequencyType.DAILY,
      frequencyInterval: 1,
      nextDueDate: yesterday,
      isInstallment: false,
      isActive: true,
      notes: 'Regola scaduta ieri per testare recupero',
    },
  });

  console.log(`  ✅ Extra: ${yesterdayRule.description} - ${yesterdayRule.amount} EUR (scaduta ieri)`);

  console.log(`\n🎯 Test Setup Completato!`);
  console.log(`📊 Statistiche:`);
  console.log(`   - Utente Test: ${testUser.name || testUser.email}`);
  console.log(`   - Account: ${userAccount.name}`);
  console.log(`   - Regole create: ${rulesToCreate.length + 1}`);
  console.log(`   - Regole che scadono oggi: ${rulesToCreate.length}`);
  console.log(`   - Regole scadute: 1`);
  
  console.log(`\n🚀 Per testare il sistema, esegui:`);
  console.log(`   curl -X GET "http://localhost:3000/api/cron/recurring-transactions" \\`);
  console.log(`     -H "Authorization: Bearer your-cron-secret" \\`);
  console.log(`     -H "Content-Type: application/json"`);
}

main()
  .catch(async (e) => {
    console.error('❌ Errore durante il seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });