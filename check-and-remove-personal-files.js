const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Keywords that indicate non-sermon content
const personalKeywords = [
  'bank', 'account', 'attorney', 'lawyer', 'contract', 'invoice',
  'payment', 'financial', 'tax', 'resume', 'cover letter',
  'vendor', 'customer', 'employee', 'estimate', 'transmittal',
  'ferrara', 'blanca', 'jail', 'scholarship'
];

async function findAndRemovePersonalFiles() {
  console.log('🔍 Scanning database for personal files...\n');

  try {
    // Get all sermons
    const { data: sermons, error } = await supabase
      .from('sermons')
      .select('id, title, date, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Total sermons in database: ${sermons.length}\n`);

    // Find suspicious entries
    const suspicious = sermons.filter(sermon => {
      const titleLower = sermon.title.toLowerCase();
      return personalKeywords.some(keyword => titleLower.includes(keyword));
    });

    if (suspicious.length === 0) {
      console.log('✅ No suspicious files found in database!');
      return;
    }

    console.log(`⚠️  Found ${suspicious.length} potentially personal files:\n`);

    suspicious.forEach((s, i) => {
      console.log(`${i + 1}. "${s.title}"`);
      console.log(`   ID: ${s.id}`);
      console.log(`   Uploaded: ${new Date(s.created_at).toLocaleString()}\n`);
    });

    // Delete them
    console.log('🗑️  Deleting personal files from database...\n');

    const idsToDelete = suspicious.map(s => s.id);

    const { error: deleteError } = await supabase
      .from('sermons')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) throw deleteError;

    console.log(`✅ Successfully deleted ${suspicious.length} personal files from database`);

    // Show remaining count
    const { count } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Remaining sermons in database: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAndRemovePersonalFiles();
