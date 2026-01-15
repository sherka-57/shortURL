import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function generateCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { longUrl } = JSON.parse(event.body);

    if (!longUrl) {
      return { statusCode: 400, body: 'Missing longUrl' };
    }

    let shortCode;
    let exists = true;

    while (exists) {
      shortCode = generateCode();
      const { data } = await supabase
        .from('urls')
        .select('id')
        .eq('short_code', shortCode)
        .limit(1);

      exists = data?.length > 0;
    }

    const { error } = await supabase
      .from('urls')
      .insert([{ original_url: longUrl, short_code: shortCode }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        shortUrl: `${process.env.SITE_URL}/r/${shortCode}`
      })
    };
  } catch (err) {
    console.error('FUNCTION ERROR:', err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
