import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
	TrendingUp,
	Users,
	FileText,
	Settings,
	LogOut,
	X,
	Home,
	FileQuestion,
	CalendarCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthSessionMissingError } from '@supabase/supabase-js';
import { div } from 'framer-motion/client';

export default function Layout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [logoutError, setLogoutError] = useState<string | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true);
			setLogoutError(null);

			// Déconnexion de Supabase
			const { error } = await supabase.auth.signOut();

			if (error) {
				if (
					error instanceof AuthSessionMissingError ||
					error.message.includes('session_not_found')
				) {
					// Si l'erreur indique que la session n'existe pas, on considère que l'utilisateur est déjà déconnecté
					window.location.href = '/';
					return;
				}
				throw error;
			}

			// Redirection forcée vers la racine
			window.location.href = '/';
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
			setLogoutError(
				'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
			);
		} finally {
			setIsLoggingOut(false);
		}
	};

	const closeLogoutModal = () => {
		setShowLogoutConfirm(false);
		setLogoutError(null);
	};

	const navigation = [
		{ name: 'Tableau de bord', href: '/dashboard', icon: Home },
		{ name: 'Clients', href: '/clients', icon: Users },
		{ name: 'Créances', href: '/receivables', icon: FileText },
		{ name: 'Paramètres', href: '/settings', icon: Settings },
	];
	console.log('Current path:', JSON.stringify(location.pathname));
	const handleSubscribe = async () => {
		const { data: { session } } = await supabase.auth.getSession();
		const user = session?.user;
		if (!user) return;
	
		const { error } = await supabase.from("subscriptions").insert({
		  user_id: user.id,
		  created_at: new Date().toISOString(),
		  status: "active",
		  plan: "free",
		});
	
		if (error) {
		  console.error("Erreur création abonnement", error);
		  return;
		}
	
		navigate("/dashboard");
	  };
	  const [checking,setChecking]=useState(true)

	  useEffect(() => {
    const syncPendingProfile = async () => {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) return;
      const { data: pending, error: fetchError } = await supabase
        .from('pending_profiles')
        .select('*')
        .ilike('email', user.email)
	
	if (pending?.length===0  || !pending){
	console.log("no  pending")
	await supabase.auth.signOut();
	navigate("/signup")
	}else {
		console.log("pending:",pending);
		
	}
	const {data:existingProfile}=await supabase
	.from('profiles')
	.select('*')
	.ilike('email', user.email)
	.single()

	if (!existingProfile.subscribe){
		if (!fetchError && pending) {
			const { error: upsertError } = await supabase.from('profiles').upsert([
			  {
				id: user.id,
				email: user.email,
				name: pending[0].name,
				phone: pending[0].phone,
				company: pending[0].company,
				subscribe:true
			  },
			]);
	
		 if (upsertError)  {
			  console.error('Erreur lors de l’upsert dans pending_profiles:', upsertError);
			}
		  } else if (fetchError) {
			console.error('Erreur lors de la récupération de pending_profiles:', fetchError);
			//navigate("/signup")
		  }

	}
  
    };

    syncPendingProfile();
  }, []); // ne s'exécute qu'une seule fois au montage
	useEffect(() => {
		const verifySubscription = async () => {
		  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
	  
		  if (sessionError || !session) {
			navigate("/login");
			return;
		  }
	  
		  const user = session.user;
	  
		  const { data: subscriptions, error: subError } = await supabase
			.from("subscriptions")
			.select("id")
			.eq("user_id", user.id);
	  
		  if (subError) {
			console.error("Erreur abonnement", subError);
			await supabase.auth.signOut();
			return;
		  }
	  
		  if (!subscriptions || subscriptions.length === 0) {
			// 👇 créer un souscription gratuit
			handleSubscribe()

		}
		setChecking(false)

		};
	  
		verifySubscription();
	  }, []);
	  

	return (
<div>
	{checking?(<div>Vérification de votre compte</div>):(
	
		<div className='min-h-screen bg-gray-100'>
			{/* Sidebar */}
			<div className="group fixed inset-y-0 left-0 bg-white shadow-lg transition-all duration-200 w-20 hover:w-64 z-40">
			<Link
  to='/'
  className='group flex items-center h-16 px-4 border-b border-gray-200'
>
  <TrendingUp className='h-8 w-8 text-blue-600 flex-shrink-0' />
  <span className='ml-2 text-xl font-bold text-gray-900 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
    PaymentFlow
  </span>
</Link>
				<nav className='mt-6 px-4 space-y-1'>
				{navigation.map((item) => {
  const Icon = item.icon;
  const isActive =
    item.href === '/dashboard'
      ? location.pathname.startsWith('/dashboard')
      : location.pathname === item.href;

  return (
    <Link
      key={item.name}
      to={item.href}
      className={`
        group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-300
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <Icon className='h-5 w-5 flex-shrink-0 text-inherit' />
      <span className='ml-3 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300'>
        {item.name}
      </span>
    </Link>
  );
})}

				</nav>

				<div className='absolute bottom-0 w-full p-4 border-t border-gray-200'>
  <button
    onClick={() => setShowLogoutConfirm(true)}
    className='group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-300'
  >
    <LogOut className='h-5 w-5 flex-shrink-0 text-inherit' />
    <span className='ml-3 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300'>
      Déconnexion
    </span>
  </button>
</div>
</div>		
			{/* Main content */}
			<div className='pl-20 group-hover:pl-64 transition-all duration-200'>

				<main className='py-6'>
					<Outlet />
				</main>
			</div>

			{/* Modal de confirmation de déconnexion */}
			{showLogoutConfirm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg p-6 max-w-sm w-full mx-4'>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='text-lg font-medium text-gray-900'>
								Confirmation
							</h3>
							<button
								onClick={closeLogoutModal}
								className='text-gray-400 hover:text-gray-500'
							>
								<X className='h-5 w-5' />
							</button>
						</div>
						{logoutError && (
							<div className='mb-4 p-3 bg-red-50 text-red-700 rounded-md'>
								{logoutError}
							</div>
						)}
						<p className='text-gray-600 mb-6'>
							Êtes-vous sûr de vouloir vous déconnecter ?
						</p>
						<div className='flex justify-end space-x-4'>
							<button
								onClick={closeLogoutModal}
								className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md'
							>
								Annuler
							</button>
							<button
								onClick={handleLogout}
								disabled={isLoggingOut}
								className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
							</button>
						</div>
					</div>
				</div>
			)}
</div>
	)}
	</div>
);
}


