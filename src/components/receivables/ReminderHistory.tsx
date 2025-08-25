import { useMemo, useEffect, useState } from 'react';
import { Reminder } from '../../types/database';
import { X } from 'lucide-react';
import { decodeReminderStatus } from '../../lib/decodeReminderStatus';
import { supabase } from '../../lib/supabase';

type ReminderHistoryProps = {
	receivableId: string;
	reminders: Reminder[];
	onClose: () => void;
};

const ReminderHistory = ({
	receivableId,
	reminders,
	onClose,
}: ReminderHistoryProps) => {
	const filteredReminders = useMemo(() => {
		return reminders.filter(
			(reminder) => reminder.receivable_id === receivableId
		);
	}, [reminders, receivableId]);

	const [openStatus, setOpenStatus] = useState<Record<string, boolean | null>>({});

	useEffect(() => {
		const fetchOpenStatus = async () => {
			const status: Record<string, boolean | null> = {};
			for (const reminder of filteredReminders) {
				const emailId = reminder.email_id;
				if (!emailId) {
					status[reminder.id] = null; // Non suivi
					continue;
				}
				// Vérifie dans la table email_opens si une ouverture existe
				const { data, error } = await supabase
					.from('email_opens')
					.select('id')
					.eq('email_id', emailId)
					.limit(1)
					.maybeSingle();
				if (error) {
					status[reminder.id] = null;
				} else {
					status[reminder.id] = !!data;
				}
			}
			setOpenStatus(status);
		};
		if (filteredReminders.length > 0) fetchOpenStatus();
	}, [filteredReminders]);

	return (
		<div className='fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-scroll'>
			<div className='min-h-screen py-8 px-4 flex items-center justify-center'>
				<div className='relative bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto'>
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
					>
						<X className='h-6 w-6' />
					</button>
					<h2 className='text-2xl font-bold mb-2'>Historique des relances</h2>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Date
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										type de Relance
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Ouverture Email
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{filteredReminders.map((record) => (
									<tr key={record.id} className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											{new Date(record.reminder_date).toLocaleString('fr-FR')}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											{decodeReminderStatus(record.reminder_type)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											{openStatus[record.id] === undefined ? '...' : openStatus[record.id] === null ? 'Non suivi' : openStatus[record.id] ? 'Ouvert' : 'Non ouvert'}
										</td>
									</tr>
								))}
								{filteredReminders.length === 0 && (
									<tr>
										<td
											colSpan={3}
											className='px-6 py-4 text-center text-gray-500'
										>
											Aucune relance trouvée
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReminderHistory;
