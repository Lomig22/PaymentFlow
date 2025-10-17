import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Reminder } from '../../src/types/database';
import { useReminderOpenStatus } from '../../src/hooks/useReminderOpenStatus';
import { decodeReminderStatus } from '../../src/lib/decodeReminderStatus';

type ReminderHistoryProps = {
	receivableId: string;
	reminders: Reminder[];
	onClose: () => void;
};

function ReminderHistory({
	receivableId,
	reminders,
	onClose,
}: ReminderHistoryProps) {
	// Maintient une copie locale rafraîchie des rappels pour cette créance
	const [liveReminders, setLiveReminders] = useState<Reminder[]>(() =>
		(reminders || []).filter((r) => r.receivable_id === receivableId)
	);

	const filteredReminders = useMemo(() => {
		return (liveReminders || []).filter(
			(reminder) => reminder.receivable_id === receivableId
		);
	}, [liveReminders, receivableId]);

	const [openStatus, setOpenStatus] = useState<Record<string, boolean | null>>({});

	useReminderOpenStatus(receivableId, setLiveReminders, setOpenStatus);

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
}

export default ReminderHistory;
