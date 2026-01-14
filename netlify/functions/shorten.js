import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper: generate random 6-character code
function generateCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { longUrl } = JSON.parse(event.body);

    if (!longUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing longUrl' }) };
    }

    // Generate a unique short code
    let shortCode;
    let exists = true;

    while (exists) {
      shortCode = generateCode();
      const { data } = await supabase
        .from('urls')
        .select('id')
        .eq('short_code', shortCode)
        .limit(1);

      exists = data.length > 0;
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('urls')
      .insert([{ original_url: longUrl, short_code: shortCode }]);

    if (error) {
      console.error(error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Database insert failed' }) };
    }

    // Construct full short URL
    const shortUrl = `${process.env.SITE_URL}/r/${shortCode}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
}
