import React, { useState } from 'react';
import { Mail, User, Bell, Shield } from 'lucide-react';
import EmailSettings from './EmailSettings';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import ReminderProfileSettings from './ReminderProfileSettings';

export default function Settings() {
	const [activeTab, setActiveTab] = useState('email');

	const tabs = [
		{ id: 'email', name: 'Paramètres email', icon: Mail, component: EmailSettings },
		{ id: 'profile', name: 'Profil', icon: User, component: ProfileSettings },
		{ id: 'notifications', name: 'Notifications', icon: Bell, component: NotificationSettings },
		{ id: 'security', name: 'Sécurité', icon: Shield, component: SecuritySettings },
		{ id: 'reminder_profile', name: 'Profil de rappel', icon: User, component: ReminderProfileSettings },
	];

	const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || EmailSettings;

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold text-gray-900 mb-6'>Paramètres</h1>

			<div className='bg-white rounded-lg shadow flex'>
				{/* Sidebar Vertical Menu */}
				<div className='w-64 border-r border-gray-200 p-4'>
					<nav className='flex flex-col space-y-2'>
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center px-4 py-2 rounded-md text-left ${
										activeTab === tab.id
											? 'bg-blue-100 text-blue-700 font-semibold'
											: 'text-gray-600 hover:bg-gray-100'
									}`}
								>
									<Icon className='h-5 w-5 mr-3' />
									{tab.name}
								</button>
							);
						})}
					</nav>
				</div>

				{/* Content Area */}
				<div className='flex-1 p-6'>
					<ActiveComponent />
				</div>
			</div>
		</div>
	);
}
