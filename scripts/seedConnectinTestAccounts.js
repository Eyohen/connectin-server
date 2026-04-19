require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('../models');

const {
  User,
  PersonalProfile,
  BusinessProfile,
  Connection,
  Opportunity,
  OpportunityInterest,
  sequelize,
} = db;

const SHARED_PASSWORD = 'Password123!';

const personalAccounts = [
  ['maya.okonkwo@test.connectin.local', 'Maya', 'Okonkwo', 'Startup advisor and angel investor', 'I help early-stage founders refine partnerships, fundraising strategy, and market entry.'],
  ['david.mensah@test.connectin.local', 'David', 'Mensah', 'Procurement and vendor sourcing lead', 'I source reliable vendors for enterprise projects across West Africa.'],
  ['amina.bello@test.connectin.local', 'Amina', 'Bello', 'Product manager exploring partnerships', 'I build digital products and seek strategic product and distribution partners.'],
  ['kwame.boateng@test.connectin.local', 'Kwame', 'Boateng', 'Investment analyst', 'I evaluate growth companies and connect founders with sector-focused capital.'],
  ['sarah.njeri@test.connectin.local', 'Sarah', 'Njeri', 'Operations consultant', 'I support SMEs with operating systems, process design, and expansion planning.'],
  ['tunde.adeleke@test.connectin.local', 'Tunde', 'Adeleke', 'Software engineer and API specialist', 'I build integrations, internal tools, and B2B workflow automation.'],
  ['linda.moyo@test.connectin.local', 'Linda', 'Moyo', 'Business development strategist', 'I help companies identify partnerships, channels, and market-entry opportunities.'],
  ['yusuf.diallo@test.connectin.local', 'Yusuf', 'Diallo', 'Logistics and trade facilitator', 'I connect importers, exporters, and logistics providers across African trade corridors.'],
  ['chika.eze@test.connectin.local', 'Chika', 'Eze', 'Talent and job placement partner', 'I help companies source specialist talent for technology and operations roles.'],
  ['elena.kimani@test.connectin.local', 'Elena', 'Kimani', 'Healthcare partnerships consultant', 'I support health-tech collaborations, pilots, and ecosystem partnerships.'],
];

const businessAccounts = [
  ['techventures@test.connectin.local', 'TechVentures Inc.', 'Daniel Cole', 'startup', 'Technology', 'Building enterprise SaaS products and API infrastructure for African businesses.', 'Lagos', 'Nigeria'],
  ['greenscale@test.connectin.local', 'GreenScale Solutions', 'Nora Abebe', 'sme', 'Healthcare', 'Health-tech company building digital care and community health platforms.', 'Nairobi', 'Kenya'],
  ['atlascapital@test.connectin.local', 'Atlas Capital Group', 'Kojo Annan', 'enterprise', 'Finance', 'Investment firm backing high-growth B2B companies across Africa.', 'Accra', 'Ghana'],
  ['bloomstrategy@test.connectin.local', 'Bloom Strategy', 'Fatima Yusuf', 'agency', 'Marketing', 'Growth strategy agency helping B2B companies launch and scale.', 'Cape Town', 'South Africa'],
  ['novabridge@test.connectin.local', 'NovaBridge Labs', 'Eric Habineza', 'startup', 'Technology', 'AI research and product lab seeking commercialization partners.', 'Kigali', 'Rwanda'],
  ['meridianlogistics@test.connectin.local', 'Meridian Logistics', 'Ada Balogun', 'enterprise', 'Manufacturing', 'Supply chain and warehousing operator supporting regional trade.', 'Lagos', 'Nigeria'],
  ['eduprime@test.connectin.local', 'EduPrime Africa', 'Grace Wambui', 'sme', 'Education', 'Digital learning platform for professional upskilling and enterprise training.', 'Kampala', 'Uganda'],
  ['keystonepartners@test.connectin.local', 'Keystone Partners', 'Samuel Otieno', 'agency', 'Finance', 'Corporate finance and M&A advisory firm for mid-market companies.', 'Dar es Salaam', 'Tanzania'],
  ['nexusdigital@test.connectin.local', 'Nexus Digital', 'Ifeoma Umeh', 'agency', 'Marketing', 'Digital transformation and customer acquisition agency for SMEs.', 'Abuja', 'Nigeria'],
  ['vantageanalytics@test.connectin.local', 'Vantage Analytics', 'Peter Kamau', 'startup', 'Technology', 'Data analytics company helping enterprises turn operational data into decisions.', 'Nairobi', 'Kenya'],
];

const opportunities = [
  ['techventures@test.connectin.local', 'Looking for SaaS Integration Partner', 'Partnerships', 'We need a partner to integrate our CRM and workflow tools with enterprise platforms across finance and retail.', '$10k - $25k', 'Remote'],
  ['meridianlogistics@test.connectin.local', 'Warehouse Management Vendor Needed', 'Vendor Sourcing', 'Seeking a reliable vendor for warehouse management system rollout across three locations.', '$50k - $100k', 'Lagos, Nigeria'],
  ['eduprime@test.connectin.local', 'Joint Venture: EdTech Expansion into East Africa', 'Joint Ventures', 'Looking for a partner to co-invest and co-develop our digital learning platform for East African markets.', 'Equity partnership', 'East Africa'],
  ['novabridge@test.connectin.local', 'Marketing Strategy Consultant for AI Product Launch', 'Contracts', 'Need an experienced B2B marketing consultant to develop and execute go-to-market strategy for a new AI product.', '$15k - $30k', 'Remote'],
  ['greenscale@test.connectin.local', 'Seed Investment Round: HealthTech Platform', 'Investment', 'Raising a seed round for our health-tech platform and looking for investors with healthcare or impact experience.', '$500k raise', 'Nairobi, Kenya'],
  ['keystonepartners@test.connectin.local', 'Financial Advisory Services Contract', 'Contracts', 'Seeking a finance advisory partner for an upcoming manufacturing-sector M&A transaction.', 'Negotiable', 'Dar es Salaam, Tanzania'],
];

const upsertUser = async ({ email, passwordHash, userType }, transaction) => {
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      email,
      password: passwordHash,
      userType,
      verified: true,
      status: 'active',
      verificationToken: null,
      verificationTokenExpires: null,
      onboardingCompleted: true,
      onboardingStep: 3,
    },
    transaction,
  });

  await user.update({
    password: passwordHash,
    userType,
    verified: true,
    status: 'active',
    verificationToken: null,
    verificationTokenExpires: null,
    onboardingCompleted: true,
    onboardingStep: 3,
  }, { transaction });

  return user;
};

const seed = async () => {
  let transaction;

  try {
    await sequelize.sync({ alter: true });
    transaction = await sequelize.transaction();
    const passwordHash = await bcrypt.hash(SHARED_PASSWORD, 12);
    const usersByEmail = new Map();

    for (const [email, firstName, lastName, headline, bio] of personalAccounts) {
      const user = await upsertUser({ email, passwordHash, userType: 'personal' }, transaction);
      await PersonalProfile.upsert({
        userId: user.id,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        headline,
        bio,
        phone: '+234 700 000 0000',
        website: 'https://connectin.example.com',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        address: 'Connectin Test Workspace',
        onboardingStep: 3,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      }, { transaction });
      usersByEmail.set(email, user);
    }

    for (const [email, businessName, contactName, businessType, industry, description, city, country] of businessAccounts) {
      const user = await upsertUser({ email, passwordHash, userType: 'business' }, transaction);
      await BusinessProfile.upsert({
        userId: user.id,
        businessName,
        contactName,
        businessType,
        industry,
        description,
        phone: '+234 701 000 0000',
        website: `https://${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.example.com`,
        country,
        state: city,
        city,
        address: `${city} business district`,
        onboardingStep: 3,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      }, { transaction });
      usersByEmail.set(email, user);
    }

    for (const [email, title, category, description, budget, location] of opportunities) {
      const owner = usersByEmail.get(email);
      await Opportunity.findOrCreate({
        where: { ownerId: owner.id, title },
        defaults: {
          ownerId: owner.id,
          title,
          category,
          description,
          budget,
          location,
          status: 'active',
        },
        transaction,
      });
    }

    const connectionPairs = [
      ['maya.okonkwo@test.connectin.local', 'techventures@test.connectin.local', 'connected'],
      ['david.mensah@test.connectin.local', 'meridianlogistics@test.connectin.local', 'connected'],
      ['amina.bello@test.connectin.local', 'novabridge@test.connectin.local', 'connected'],
      ['kwame.boateng@test.connectin.local', 'atlascapital@test.connectin.local', 'connected'],
      ['greenscale@test.connectin.local', 'elena.kimani@test.connectin.local', 'pending'],
      ['keystonepartners@test.connectin.local', 'maya.okonkwo@test.connectin.local', 'pending'],
      ['tunde.adeleke@test.connectin.local', 'vantageanalytics@test.connectin.local', 'pending'],
      ['bloomstrategy@test.connectin.local', 'linda.moyo@test.connectin.local', 'pending'],
    ];

    for (const [requesterEmail, recipientEmail, status] of connectionPairs) {
      const requester = usersByEmail.get(requesterEmail);
      const recipient = usersByEmail.get(recipientEmail);
      const [connection] = await Connection.findOrCreate({
        where: { requesterId: requester.id, recipientId: recipient.id },
        defaults: {
          requesterId: requester.id,
          recipientId: recipient.id,
          status,
          message: 'Seeded test connection',
          respondedAt: status === 'connected' ? new Date() : null,
        },
        transaction,
      });
      await connection.update({
        status,
        respondedAt: status === 'connected' ? new Date() : null,
      }, { transaction });
    }

    const firstOpportunity = await Opportunity.findOne({ transaction });
    const interestedUser = usersByEmail.get('sarah.njeri@test.connectin.local');
    if (firstOpportunity && interestedUser) {
      await OpportunityInterest.findOrCreate({
        where: { opportunityId: firstOpportunity.id, userId: interestedUser.id },
        defaults: {
          opportunityId: firstOpportunity.id,
          userId: interestedUser.id,
          message: 'I can support this opportunity and would like to discuss the scope.',
          contactPreference: 'Platform Message',
        },
        transaction,
      });
    }

    await transaction.commit();

    console.log('\nConnectin test accounts seeded successfully.');
    console.log(`Shared password: ${SHARED_PASSWORD}`);
    console.log('\nSample accounts:');
    console.log('- maya.okonkwo@test.connectin.local');
    console.log('- techventures@test.connectin.local');
    console.log('- greenscale@test.connectin.local');
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Failed to seed Connectin test accounts:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();
