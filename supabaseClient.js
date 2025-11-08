import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aoekyawgvkdvwoakuvsw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZWt5YXdndmtkdndvYWt1dnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzExOTQsImV4cCI6MjA3ODIwNzE5NH0.xnaqWmuBJcsLT0wfKld7NdqdiLcxlxk0gdGCpNzq4Ho";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
