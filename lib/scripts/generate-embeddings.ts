import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { getShows, getVendors, getSafes } from '@/lib/supabase/queries';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or service role key is not defined in .env.local');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in .env.local');
}
const embeddingModel = openai.embedding('text-embedding-3-small');

type Document = {
  itemId: string;
  itemType: 'show' | 'vendor' | 'safe';
  content: string;
};

async function generateEmbeddings() {
  console.log('Starting embedding generation...');

  // 1. Clear existing embeddings
  console.log('Clearing existing embeddings...');
  const { error: deleteError } = await supabaseAdmin
    .from('item_embeddings')
    .delete()
    .neq('id', 0); // Trick to delete all rows

  if (deleteError) {
    console.error('Error clearing existing embeddings:', deleteError);
    return;
  }

  // 2. Fetch all data directly using the admin client
  console.log('Fetching data from the database...');
  const [
    { data: shows, error: showsError },
    { data: vendors, error: vendorsError },
    { data: safes, error: safesError },
  ] = await Promise.all([
    supabaseAdmin.from('shows').select('*'),
    supabaseAdmin.from('vendors').select('*'),
    supabaseAdmin.from('safes').select('*'),
  ]);

  if (showsError || vendorsError || safesError) {
    console.error('Error fetching data:', showsError || vendorsError || safesError);
    return;
  }
  
  console.log(`Found ${shows.length} shows, ${vendors.length} vendors, and ${safes.length} safes.`);

  // 3. Prepare documents for embedding
  const documents: Document[] = [];

  shows.forEach(show => {
    documents.push({
      itemId: show.id,
      itemType: 'show',
      content: `Show: ${show.show_name}, Venue: ${show.venue_name}, Location: ${show.city}, ${show.state}, Dates: ${show.start_date} to ${show.end_date}`,
    });
  });

  vendors.forEach(vendor => {
    documents.push({
      itemId: vendor.iid,
      itemType: 'vendor',
      content: `Vendor: ${vendor.name}, Home Base: ${vendor.city}, ${vendor.state}, Capacity: ${vendor.capacity} safes`,
    });
  });

  safes.forEach(safe => {
    documents.push({
      itemId: safe.id,
      itemType: 'safe',
      content: `Safe: ${safe.name}, Status: ${safe.status}, Current Location: ${safe.last_known_location}`,
    });
  });

  if (documents.length === 0) {
    console.log('No documents to embed. Exiting.');
    return;
  }
  console.log(`Prepared ${documents.length} documents for embedding.`);

  // 4. Generate embeddings in batches
  console.log('Generating embeddings...');
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: documents.map(doc => doc.content),
  });
  console.log('Embeddings generated successfully.');

  // 5. Store new embeddings in the database
  const recordsToInsert = documents.map((doc, i) => ({
    item_id: doc.itemId,
    item_type: doc.itemType,
    content: doc.content,
    embedding: embeddings[i],
  }));

  console.log(`Inserting ${recordsToInsert.length} records into the database...`);
  const { error: insertError } = await supabaseAdmin
    .from('item_embeddings')
    .insert(recordsToInsert);

  if (insertError) {
    console.error('Error inserting embeddings:', insertError);
  } else {
    console.log('✅ Embeddings generated and stored successfully!');
  }
}

generateEmbeddings();
