import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzdejevtgfuuyzdcahdl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZGVqZXZ0Z2Z1dXl6ZGNhaGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzEzODMsImV4cCI6MjA3OTI0NzM4M30._KvHHRgOjEdbZlSQr7ohNGmQcqkVmSW3P35F7e-Czw0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

