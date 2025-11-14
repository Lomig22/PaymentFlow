import { cookies } from 'next/headers';
import Dashboard from './Dashboard';
import { createClient } from '../../../src/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <Dashboard user={user} />;
}
