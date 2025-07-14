import { supabase } from '../lib/supabase';

export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}


export async function checkPaymentStatus(): Promise<boolean> {
  try {
    const details = await getSubscriptionDetails();
    return details?.status?.toLowerCase() === 'active';
  } catch (error) {
    console.error("❌ Failed to check subscription:", error);
    return false; // default to no access on error
  }
}


export async function processPayment(paymentDetails: any): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new PaymentError('Authentication required', 'AUTH_REQUIRED');

    const now = new Date();
    const endDate = new Date();
    const plan = paymentDetails.plan === 'monthly' ? 'monthly' : 'annual';

    // Extend end date
    if (plan === 'monthly') {
      endDate.setMonth(now.getMonth() + 1);
    } else {
      endDate.setFullYear(now.getFullYear() + 1);
    }

    const { error: insertError } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan,
      status: 'active',
      start_date: now.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    if (insertError) throw new PaymentError('Failed to create subscription', 'DB_ERROR', { insertError });

    return true;
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error instanceof PaymentError ? error : new PaymentError('Unexpected error', 'UNKNOWN_ERROR', { originalError: error });
  }
}


export async function getSubscriptionDetails(): Promise<any> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new PaymentError('Authentication required', 'AUTH_REQUIRED');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('end_date', { ascending: false })
      .limit(1)
   //   .single();
    .maybeSingle(); // ✅ safer than .single()

    if (error || !data) {
      return {
        status: 'inactive',
        plan: 'free',
        features: ['Limited Subjects', 'Basic Assessments']
      };
    }

    return {
      status: 'active',
      plan: data.plan,
      startDate: data.start_date,
      endDate: data.end_date,
      features: ['All Subjects', 'Unlimited Assessments', 'Community Support', 'Class Requests']
    };
  } catch (error) {
    throw error instanceof PaymentError ? error : new PaymentError('Error getting subscription', 'UNKNOWN_ERROR', { originalError: error });
  }
}
