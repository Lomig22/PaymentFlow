import { useMemo, useEffect, useState } from 'react';
import { Reminder } from '../../types/database';
import { X } from 'lucide-react';
import { decodeReminderStatus } from '../../lib/decodeReminderStatus';
import { supabase } from '../../lib/supabase';
import EmailOpenTester from './EmailOpenTester';

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
	const [receivableEmailId, setReceivableEmailId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		let interval: number | null = null;

		// Charger l'email_id au niveau de la créance pour fallback
		const fetchReceivableEmailId = async () => {
			const { data } = await supabase
				.from('receivables')
				.select('email_id')
				.eq('id', receivableId)
				.single();
			if (!cancelled) setReceivableEmailId(data?.email_id ?? null);
		};

		const fetchOpenStatus = async () => {
			const status: Record<string, boolean | null> = {};
			if (filteredReminders.length === 0) {
				if (!cancelled) setOpenStatus(status);
				return;
			}

			// Renseigner par défaut Non suivi lorsqu'il n'y a pas d'email_id
			const emailIdSet = new Set<string>();
			for (const r of filteredReminders) {
				if (r.email_id) emailIdSet.add(r.email_id);
			}
			if (receivableEmailId) emailIdSet.add(receivableEmailId);
			const emailIds = Array.from(emailIdSet);

			// Pré-remplir Non suivi pour ceux sans email_id
			for (const r of filteredReminders) {
				if (!r.email_id && !receivableEmailId) status[r.id] = null;
			}

			if (emailIds.length > 0) {
				const { data, error } = await supabase
					.from('email_opens')
					.select('email_id')
					.in('email_id', emailIds);
				if (cancelled) return;
				if (!error && data) {
					const opened = new Set<string>(data.map((d: any) => d.email_id));
					for (const r of filteredReminders) {
						const idToCheck = r.email_id || receivableEmailId || null;
						if (!idToCheck) continue;
						status[r.id] = opened.has(idToCheck);
					}
				}
			}

			if (!cancelled) setOpenStatus(status);
		};

		// Appel initial + polling toutes les 5 secondes
		fetchReceivableEmailId().then(fetchOpenStatus);
		interval = window.setInterval(fetchOpenStatus, 5000);

		return () => {
			cancelled = true;
			if (interval) window.clearInterval(interval);
		};
	}, [filteredReminders, receivableId]);

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
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Test
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
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											{record.email_id || receivableEmailId ? (
												<EmailOpenTester
													emailId={record.email_id || receivableEmailId!}
												/>
											) : (
												<span className='text-gray-400'>—</span>
											)}
										</td>
									</tr>
								))}
								{filteredReminders.length === 0 && (
									<tr>
										<td
											colSpan={4}
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
