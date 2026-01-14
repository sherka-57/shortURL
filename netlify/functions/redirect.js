import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
  const shortCode = event.path.replace('/.netlify/functions/redirect/', '');

  if (!shortCode) {
    return { statusCode: 400, body: 'Missing short code' };
  }

  try {
    const { data, error } = await supabase
      .from('urls')
      .select('original_url, clicks')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      return { statusCode: 404, body: 'Link not found' };
    }

    // Increment clicks
    await supabase
      .from('urls')
      .update({ clicks: data.clicks + 1 })
      .eq('short_code', shortCode);

    // Redirect
    return {
      statusCode: 302,
      headers: { Location: data.original_url },
      body: '',
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
