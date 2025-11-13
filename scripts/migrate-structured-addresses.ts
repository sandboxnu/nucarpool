import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Parses a full address string into structured components
 */
function parseAddressFromString(fullAddress: string): { street: string; city: string; state: string } {
  let street = "";
  let city = "";
  let state = "";

  if (!fullAddress || fullAddress.trim() === "") {
    return { street: "", city: "", state: "" };
  }

  const parts = fullAddress.split(",").map(part => part.trim());
  
  // Parse street from first part
  if (parts.length > 0) {
    const streetParts = parts[0].split(" ");
    
    // Check if first part is a building number
    if (streetParts.length > 0 && !isNaN(Number(streetParts[0]))) {
      street = streetParts.slice(1).join(" ");
    } else {
      street = parts[0];
    }
  }

  // Parse city from second part
  if (parts.length > 1) {
    city = parts[1];
  }

  // Parse state from third part
  if (parts.length > 2) {
    const stateZipParts = parts[2].split(" ");
    const stateParts: string[] = [];
    for (const part of stateZipParts) {
      if (!isNaN(Number(part))) break;
      stateParts.push(part);
    }
    state = stateParts.join(" ");
  }

  return { street, city, state };
}

/**
 * migrates existing full addresses to structured fields without affecting other data
 */
async function migrateStructuredAddresses() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { startAddress: { not: "" } },
        { companyAddress: { not: "" } }
      ]
    }
  });


  let migratedCount = 0;

  for (const user of users) {
    const updates: any = {};

    // only update if the structured fields are currently empty
    const shouldUpdateStart = user.startAddress && 
                             user.startAddress !== "" && 
                             (!user.startStreet || !user.startCity || !user.startState);
    
    const shouldUpdateCompany = user.companyAddress && 
                               user.companyAddress !== "" && 
                               (!user.companyStreet || !user.companyCity || !user.companyState);

    // parse and migrate start address if needed
    if (shouldUpdateStart) {
      const parsed = parseAddressFromString(user.startAddress);
      if (parsed.street || parsed.city || parsed.state) {
        updates.startStreet = parsed.street;
        updates.startCity = parsed.city;
        updates.startState = parsed.state;
      }
    }

    // parse and migrate company address if needed
    if (shouldUpdateCompany) {
      const parsed = parseAddressFromString(user.companyAddress);
      if (parsed.street || parsed.city || parsed.state) {
        updates.companyStreet = parsed.street;
        updates.companyCity = parsed.city;
        updates.companyState = parsed.state;
      }
    }

    // update user if we have changes
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates
      });
      migratedCount++;
    }
  }

}

// dry run function
async function dryRun() {
  console.log('DRY RUN MODE - No changes will be made\n');
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { startAddress: { not: "" } },
        { companyAddress: { not: "" } }
      ]
    },
    select: {
      id: true,
      startAddress: true,
      startStreet: true,
      startCity: true,
      startState: true,
      companyAddress: true,
      companyStreet: true,
      companyCity: true,
      companyState: true
    }
  });

  console.log(`Found ${users.length} users that would be updated:\n`);

  let wouldUpdateCount = 0;

  users.forEach(user => {
    let userWouldUpdate = false;
    
    if (user.startAddress && (!user.startStreet || !user.startCity || !user.startState)) {
      const parsed = parseAddressFromString(user.startAddress);
      console.log(`  User ${user.id}:`);
      console.log(`   START ADDRESS:`);
      console.log(`     Current full: "${user.startAddress}"`);
      console.log(`     Current structured: street="${user.startStreet}", city="${user.startCity}", state="${user.startState}"`);
      console.log(`     Would set: street="${parsed.street}", city="${parsed.city}", state="${parsed.state}"`);
      userWouldUpdate = true;
    }
    
    if (user.companyAddress && (!user.companyStreet || !user.companyCity || !user.companyState)) {
      const parsed = parseAddressFromString(user.companyAddress);
      if (!userWouldUpdate) console.log(`  User ${user.id}:`);
      console.log(`   COMPANY ADDRESS:`);
      console.log(`     Current full: "${user.companyAddress}"`);
      console.log(`     Current structured: street="${user.companyStreet}", city="${user.companyCity}", state="${user.companyState}"`);
      console.log(`     Would set: street="${parsed.street}", city="${parsed.city}", state="${parsed.state}"`);
      userWouldUpdate = true;
    }
    
    if (userWouldUpdate) {
      wouldUpdateCount++;
      console.log('   ---');
    }
  });

  console.log(`\nSummary: Would update ${wouldUpdateCount} users`);
}

// main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  if (isDryRun) {
    await dryRun();
  } else {
    console.log('Press Ctrl+C within 5 seconds to cancel...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await migrateStructuredAddresses();
  }
}

// run with error handling
main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });