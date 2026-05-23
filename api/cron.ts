import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  // 1. Authorization Check (for Upstash QStash or Vercel Cron)
  const authHeader = req.headers.authorization;
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    req.headers['x-vercel-cron'] !== '1'
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 2. Fetch active tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('completed', false);

    if (error) throw error;

    const now = new Date();
    const sentEmails = [];

    // 3. Process each task for email reminders
    for (const task of tasks) {
      if (!task.reminder_config) continue;
      
      const config = typeof task.reminder_config === 'string' 
        ? JSON.parse(task.reminder_config) 
        : task.reminder_config;

      // Skip if email is disabled, already sent, or no reminder type
      if (!config.email || config.emailSent || config.type === 'none') continue;

      let targetDate: Date | null = null;
      if (config.type === 'exact' && task.due_date && task.due_time) {
        targetDate = new Date(`${task.due_date}T${task.due_time}`);
      } else if (config.type === 'custom' && config.customTime) {
        targetDate = new Date(config.customTime);
      } else if (task.due_date && task.due_time) {
        const exactTime = new Date(`${task.due_date}T${task.due_time}`);
        if (config.type === '10m_before') {
          targetDate = new Date(exactTime.getTime() - 10 * 60000);
        } else if (config.type === '1h_before') {
          targetDate = new Date(exactTime.getTime() - 60 * 60000);
        } else if (config.type === '1d_before') {
          targetDate = new Date(exactTime.getTime() - 24 * 60 * 60000);
        }
      }

      if (targetDate) {
        const diffMs = targetDate.getTime() - now.getTime();
        
        // Trigger if the target time is within the last 5 minutes
        // We check if it's past the target date, but not too far past it (to prevent sending old emails)
        if (diffMs <= 0 && diffMs >= -300000) {
          
          // Fetch the exact user email using Admin API
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(task.user_id);
          if (userError || !userData?.user?.email) continue;
          
          const userEmail = userData.user.email;

          // Send Email via Resend
          await resend.emails.send({
            from: 'Aether Todo <onboarding@resend.dev>',
            to: userEmail,
            subject: `Reminder: ${task.title}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
                <h2 style="color: #6366f1; margin-bottom: 5px;">Aether Tasks</h2>
                <p style="color: #4b5563; font-size: 14px;">You have a task due soon!</p>
                <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #111827;">${task.title}</h3>
                  ${task.description ? `<p style="color: #4b5563;">${task.description}</p>` : ''}
                  <div style="margin-top: 15px; font-size: 12px; color: #6b7280; font-weight: bold;">
                    DUE: ${task.due_date} at ${task.due_time}
                  </div>
                </div>
                <p style="font-size: 12px; color: #9ca3af;">Sent by Aether Automation</p>
              </div>
            `
          });

          // Mark as sent
          const updatedConfig = { ...config, emailSent: true };
          await supabase
            .from('tasks')
            .update({ reminder_config: updatedConfig })
            .eq('id', task.id);
            
          sentEmails.push(task.id);
        }
      }
    }

    return res.status(200).json({ success: true, emailsSent: sentEmails.length, processed: sentEmails });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
