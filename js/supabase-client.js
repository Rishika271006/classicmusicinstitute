/**
 * Classic Music Institute - Supabase Client Integration
 * Domain: classicinstitute.com
 * Handles real-time cloud database sync for audition bookings, contact messages, and packages.
 */

const SUPABASE_CONFIG = {
  // Classic Music Institute Supabase Project URL
  url: window.SUPABASE_URL || localStorage.getItem('classic_supabase_url') || 'https://wokewtrrgyexbwjropgn.supabase.co',
  // Your Supabase Publishable Key
  publishableKey: 'sb_publishable_FLTQgdBCO5loq1NWo4Ll5g_I-U8H4-H'
};

let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const projectUrl = SUPABASE_CONFIG.url || localStorage.getItem('classic_supabase_url');
  const apiKey = SUPABASE_CONFIG.publishableKey;

  if (projectUrl && apiKey && window.supabase) {
    try {
      supabaseInstance = window.supabase.createClient(projectUrl, apiKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
    }
  }
  return null;
}

const ClassicSupabase = {
  getClient: getSupabaseClient,

  // Set or update project URL dynamically (e.g. from Admin Panel)
  setProjectUrl(url) {
    if (url) {
      localStorage.setItem('classic_supabase_url', url.trim());
      SUPABASE_CONFIG.url = url.trim();
      supabaseInstance = null;
      return getSupabaseClient();
    }
  },

  getProjectUrl() {
    return SUPABASE_CONFIG.url || localStorage.getItem('classic_supabase_url') || '';
  },

  isConfigured() {
    return Boolean(this.getProjectUrl() && SUPABASE_CONFIG.publishableKey);
  },

  // Save audition booking directly to Supabase table `audition_bookings`
  async saveAuditionBooking(bookingData) {
    const client = getSupabaseClient();
    if (!client) {
      console.log('Supabase not configured with Project URL, saving locally.');
      return { success: false, mode: 'local' };
    }

    try {
      const { data, error } = await client
        .from('audition_bookings')
        .insert([{
          full_name: bookingData.name || '',
          phone_number: bookingData.phone || '',
          email_address: bookingData.email || '',
          course_interest: bookingData.course || '',
          location_preference: bookingData.location || 'Chandigarh Campus (SCO 64-65, Sector 34-A)',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.warn('Failed to insert booking into Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save contact inquiry directly to Supabase table `contact_inquiries`
  async saveContactInquiry(inquiryData) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, mode: 'local' };
    }

    try {
      const { data, error } = await client
        .from('contact_inquiries')
        .insert([{
          full_name: inquiryData.name || '',
          phone_number: inquiryData.phone || '',
          email_address: inquiryData.email || '',
          subject: inquiryData.subject || 'General Inquiry',
          message: inquiryData.message || '',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.warn('Failed to insert inquiry into Supabase:', err);
      return { success: false, error: err.message };
    }
  }
};

window.ClassicSupabase = ClassicSupabase;
