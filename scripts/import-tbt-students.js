import { generateClient } from 'aws-amplify/data';

// List of student emails to import
const studentEmails = [
  // Add your student emails here
  'student1@example.com',
  'student2@example.com',
  'student3@example.com',
  // ... add more emails
];

async function importTBTStudents() {
  const client = generateClient();
  
  console.log('Starting TBT student import...');
  console.log(`Total emails to import: ${studentEmails.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const email of studentEmails) {
    try {
      const { data } = await client.models.TBTRegisteredStudents.create({
        input: {
          email: email
        }
      });
      
      console.log(`✅ Successfully imported: ${email}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to import ${email}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`✅ Successful imports: ${successCount}`);
  console.log(`❌ Failed imports: ${errorCount}`);
  console.log(`📊 Total processed: ${studentEmails.length}`);
}

// Run the import
importTBTStudents().catch(console.error); 