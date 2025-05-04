import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { saveNotification } from '../../lib/notification';
import { Client, Receivable, ReminderProfile } from '../../types/database';
import { X, AlertCircle, Play, Pause } from 'lucide-react';
import DelayInputJHM from '../settings/DelayInputJHM';
import ReactDateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css"; // si tu n'as pas encore importé le style
import moment from "moment";
import DateTimeInput from '../Common/DateTimpeInput';

interface ReminderSettingsModalProps {
	client: Client;
	onClose: () => void;
	reminderProfiles: ReminderProfile[];
	receivable: Receivable;
}

export default function ReminderSettingsModal({
	client,
	onClose,
	reminderProfiles,
	receivable,
}: ReminderSettingsModalProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [automaticReminder, setAutomaticReminder] = useState<boolean>(
		receivable.automatic_reminder ?? false
	);


	const [formData, setFormData] = useState({
		reminder_delay_1	: client.reminder_delay_1 || {j:0,h:0,m:1},
		reminder_delay_2: client.reminder_delay_2 || {j:0,h:0,m:2},
		reminder_delay_3: client.reminder_delay_3 || {j:0,h:0,m:3},
		reminder_delay_final: client.reminder_delay_final || {j:0,h:0,m:3},
		reminder_template_1: client.reminder_template_1 || '',
		reminder_template_2: client.reminder_template_2 || '',
		reminder_template_3: client.reminder_template_3 || '',
		reminder_template_final: client.reminder_template_final || '',
		reminder_profile: client.reminder_profile || '',
		pre_reminder_delay: client.pre_reminder_delay || {j:0,h:0,m:0},
		pre_reminder_template: client.pre_reminder_template || '',
	});
	const showError = (message: string) => {
		setError(message);
		setTimeout(() => {
		  setError(null);
		}, 3000);
	  }
	
	function convertJHMToMinutes(jhm: {j:number;h:number;m:number}| undefined): number {
		if(!jhm){
			return 60
		}
		const joursEnMinutes = jhm.j * 24 * 60;
		const heuresEnMinutes = jhm.h * 60;
		const minutes = jhm.m;
	  
		return joursEnMinutes + heuresEnMinutes + minutes;
	  }

	// Gestion de la touche Echap
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, [onClose]);

	// Désactiver le défilement du body quand la modale est ouverte
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {

		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		const {
			data: { user }
		  } = await supabase.auth.getUser();
		try {
			// Validation des délais
			if (
				convertJHMToMinutes(formData.reminder_delay_1) >= convertJHMToMinutes(formData.reminder_delay_2) ||
				convertJHMToMinutes(formData.reminder_delay_2) >= convertJHMToMinutes(formData.reminder_delay_3) ||
				convertJHMToMinutes(formData.reminder_delay_3) >= convertJHMToMinutes(formData.reminder_delay_final)
			) {
				throw new Error('Les délais doivent être strictement croissants');
			}

			const { error: updateError } = await supabase
				.from('clients')
				.update({
					reminder_delay_1: formData.reminder_delay_1,
					reminder_delay_2: formData.reminder_delay_2,
					reminder_delay_3: formData.reminder_delay_3,
					reminder_delay_final: formData.reminder_delay_final,
					reminder_template_1: formData.reminder_template_1.trim(),
					reminder_template_2: formData.reminder_template_2.trim(),
					reminder_template_3: formData.reminder_template_3.trim(),
					reminder_template_final: formData.reminder_template_final.trim(),
					reminder_profile: formData.reminder_profile,
					pre_reminder_delay: formData.pre_reminder_delay,
					pre_reminder_template: formData.pre_reminder_template,
				})
				.eq('id', client.id);
				if (user?.id) {		
					const details = JSON.stringify({
						"Numéro de facture":`${receivable.invoice_number}`,
						"Délai de relance 1": `${formData.reminder_delay_1.j||0}:${formData.reminder_delay_1.h||0}:${formData.reminder_delay_1.m||0} `,
						"Délai de relance 2": `${formData.reminder_delay_2.j||0}:${formData.reminder_delay_2.h||0}:${formData.reminder_delay_2.m||0} `,
						"Délai de relance 3": `${formData.reminder_delay_3.j||0}:${formData.reminder_delay_3.h||0}:${formData.reminder_delay_3.m||0} `,
						"Délai de relance finale":`${formData.reminder_delay_final.j||0}:${formData.reminder_delay_final.h||0}:${formData.reminder_delay_final.m||0} `,
						"Template de la relance 1": formData.reminder_template_1.trim(),
						"Template de la relance 2": formData.reminder_template_2.trim(),
						"Template de la relance 3": formData.reminder_template_3.trim(),
						"Template de la relance finale": formData.reminder_template_final.trim(),
						"Profil de relance": formData.reminder_profile,
						"Délai de prérelance": `${formData.pre_reminder_delay}`,
						"Template de la prérelance": formData.pre_reminder_template.trim(),
					  }, null, 2); // le 2 ajoute un peu d’indentation pour la lisibilité	
					try {
						await saveNotification({
							owner_id: user.id,
							is_read: false,
							type: 'info',
							message: "Mises à jour des paramètres de relance",
							details: details,
						  });
					} catch (error:any) {
					  showError(error)
					}
				  }
			if (updateError) throw updateError;
				
			setSuccess(true);
			// Attendre un peu avant de fermer pour montrer le message de succès
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (error) {
			console.error('Erreur lors de la mise à jour des paramètres:', error);
			showError(error.message || 'Impossible de mettre à jour les paramètres');
		} finally {
			setLoading(false);
		}
	};

	const handleProfileChange = (profileId: string) => {
		if (profileId === null || profileId === undefined) return;
		const selectedProfile = reminderProfiles.find(
			(profile) => profile.id === profileId
		);
		setFormData({
			...formData,
			reminder_profile: profileId,
			reminder_delay_1: selectedProfile?.delay1 || {j:0,h:0,m:1},
			reminder_delay_2: selectedProfile?.delay2 || {j:0,h:0,m:1},
			reminder_delay_3: selectedProfile?.delay3 || {j:0,h:0,m:1},
			reminder_delay_final: selectedProfile?.delay4 || {j:0,h:0,m:1},
		});
	};

	const getTemplateExample =  (step: number) => {
		const examples = {
			1: `Cher client,\n\nNous n'avons pas encore reçu le paiement de la facture {invoice_number} d'un montant de {amount}, échue depuis {days_late} jours.\n\nMerci de régulariser la situation dans les plus brefs délais.`,
			2: `Cher client,\n\nMalgré notre première relance, la facture {invoice_number} d'un montant de {amount} reste impayée.\n\nNous vous prions de procéder au règlement sous 48h.`,
			3: `Cher client,\n\nLa facture {invoice_number} d'un montant de {amount} est toujours en attente de règlement malgré nos relances.\n\nSans paiement de votre part sous 72h, nous serons contraints d'engager une procédure de recouvrement.`,
			4: `Cher client,\n\nCeci est notre dernière relance concernant la facture {invoice_number} d'un montant de {amount}.\n\nSans règlement immédiat, nous transmettrons le dossier à notre service contentieux.`,
			5: `Cher client,\n\n nous n'avons pas encore reçu le paiement de la facture n° {invoice_number}, soit {amount}. Nous vous informons que vous disposez de {days_left} jours avant la date limite.\n\nMerci de régulariser la situation dans les plus brefs délais.`,
		};
		return examples[step] || '';
	};

//Bouton Play/Pause
	const handleAutomaticReminderToggle = async () => {
		const {
			data: { user }
		  } = await supabase.auth.getUser();
		try {
			setLoading(true);
			setError(null);
			
			// Update the receivable
			const { error } = await supabase
				.from('receivables')
				.update({
					automatic_reminder: !receivable.automatic_reminder,
				})
				.eq('id', receivable.id);
			if (error) throw error;
			await saveNotification({
				owner_id: user?.id,
				is_read: false,
				type: 'info',
				message: "Mise à jour des paramètres de relance automatique" ,
				details: automaticReminder ? `Les relances sont activés pour la relance ${receivable?.invoice_number}` : `Les relances sont en pause pour la relance ${receivable?.invoice_number}`,
			});
		
			setAutomaticReminder((prevState) => !prevState);
		} catch (error:any) {
			console.error('Erreur lors de la mise à jour des paramètres:', error);
			if (user?.id) {			
					await saveNotification({
						owner_id: user?.id,
						is_read: false,
						type: 'erreur',
						message: "Mise à jour des paramètres de relance automatique échouée" ,
						details:`${error}`
					});
				}
			showError(error.message || 'Impossible de mettre à jour les paramètres');
		} finally {
			setLoading(false);
		}
	};
	function delayToDateTime(
		delay: { j: number; h: number; m: number },
		baseDate: Date = new Date()
	  ): Date {
		if (!delay) return new Date(); // fallback
	  
		const result = new Date(baseDate);
		result.setMinutes(
		  result.getMinutes() +
			(delay.j || 0) * 1440 +
			(delay.h || 0) * 60 +
			(delay.m || 0)
		);
		return result;
	  }
	  
	  function dateTimeToDelay(
		target: Date,
		baseDate: Date = new Date()
	  ): { j: number; h: number; m: number } {
		const diffMs = target.getTime() - baseDate.getTime();
		const totalMinutes = Math.round(diffMs / 60000); // arrondi à la minute près
		const j = Math.floor(totalMinutes / 1440);
		const h = Math.floor((totalMinutes % 1440) / 60);
		const m = totalMinutes % 60;
		return { j, h, m };
	  }
	  
	  

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

					<h2 className='text-2xl font-bold mb-2'>Paramètres de relance</h2>
					<p className='text-gray-600 mb-6'>Client : {client.company_name}</p>

					{error && (
						<div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center'>
							<AlertCircle className='h-5 w-5 mr-2' />
							{error}
						</div>
					)}

					{success && (
						<div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700'>
							Paramètres sauvegardés avec succès
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='grid grid-cols-2 gap-6'>
						<div className='col-span-2'>
	<label className='block text-sm font-medium text-gray-700 mb-2'>
		Profil de rappel
	</label>
	<input
		type='text'
		required
		disabled 
		value={
			reminderProfiles.find(p => p.id === formData.reminder_profile)?.name || ''
		}
		className='w-full text-gray-500 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
	/>
</div>

						  {/* Délai première relance */}
    <div>
      <DelayInputJHM
        label="Délai première relance (Jours,Heures,Minutes)"
        value={formData.reminder_delay_1}
        onChange={(value) => setFormData({ ...formData, reminder_delay_1: value })}
        disabled={false}  // Assurez-vous que ce champ soit modifiable
      />

    </div>
	

    {/* Délai deuxième relance */}
    <div>
      <DelayInputJHM
        label="Délai deuxième relance (Jours,Heures,Minutes)"
        value={formData.reminder_delay_2}
        onChange={(value) => setFormData({ ...formData, reminder_delay_2: value })}
        disabled={false}  // Assurez-vous que ce champ soit modifiable
      />
    </div>

    {/* Délai troisième relance */}
    <div>
      <DelayInputJHM
        label="Délai troisième relance (Jours,Heures,Minutes)"
        value={formData.reminder_delay_3}
        onChange={(value) => setFormData({ ...formData, reminder_delay_3: value })}
        disabled={false}  // Assurez-vous que ce champ soit modifiable
      />
    </div>

    {/* Délai relance finale */}
    <div>
      <DelayInputJHM
        label="Délai relance finale (Jours,Heures,Minutes)"
        value={formData.reminder_delay_final}
        onChange={(value) => setFormData({ ...formData, reminder_delay_final: value })}
        disabled={false}  // Assurez-vous que ce champ soit modifiable
      />
    </div>

    {/* Pré relance */}
    <div>
      <DelayInputJHM
        label="Pré relance"
        value={formData.pre_reminder_delay}
        onChange={(value) => setFormData({ ...formData, pre_reminder_delay: value })}
        disabled={false}  // Assurez-vous que ce champ soit modifiable
      />
    </div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<DateTimeInput
  label="Date/Heure d’envoi – Première relance"
  value={delayToDateTime(formData.reminder_delay_1)}
  onChange={(date) =>
    setFormData({
      ...formData,
      reminder_delay_1: dateTimeToDelay(date),
    })
  }
/>

<DateTimeInput
  label="Date/Heure d’envoi – Deuxième relance"
  value={delayToDateTime(formData.reminder_delay_2, delayToDateTime(formData.reminder_delay_1))}
  onChange={(date) =>
    setFormData({
      ...formData,
      reminder_delay_2: dateTimeToDelay(date, delayToDateTime(formData.reminder_delay_1)),
    })
  }
/>

<DateTimeInput
  label="Date/Heure d’envoi – Troisième relance"
  value={delayToDateTime(formData.reminder_delay_3, delayToDateTime(formData.reminder_delay_2))}
  onChange={(date) =>
    setFormData({
      ...formData,
      reminder_delay_3: dateTimeToDelay(date, delayToDateTime(formData.reminder_delay_2)),
    })
  }
/>

<DateTimeInput
  label="Date/Heure d’envoi – Relance finale"
  value={delayToDateTime(formData.reminder_delay_final, delayToDateTime(formData.reminder_delay_3))}
  onChange={(date) =>
    setFormData({
      ...formData,
      reminder_delay_final: dateTimeToDelay(date, delayToDateTime(formData.reminder_delay_3)),
    })
  }
/>

<DateTimeInput
  label="Date/Heure d’envoi – Pré-relance"
  value={delayToDateTime(formData.pre_reminder_delay)}
  onChange={(date) =>
    setFormData({
      ...formData,
      pre_reminder_delay: dateTimeToDelay(date),
    })
  }
/>

</div>
{/*end relance en calendrier */}
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Template Pré relance
								</label>
								<div className='relative'>
									<textarea
										rows={4}
										value={formData.pre_reminder_template}
										onChange={(e) =>
											setFormData({
												...formData,
												pre_reminder_template: e.target.value,
											})
										}
										className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables'
									/>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												pre_reminder_template: getTemplateExample(5),
											})
										}
										className='absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800'
									>
										Utiliser un exemple
									</button>
								</div>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Template première relance
								</label>
								<div className='relative'>
									<textarea
										rows={4}
										value={formData.reminder_template_1}
										onChange={(e) =>
											setFormData({
												...formData,
												reminder_template_1: e.target.value,
											})
										}
										className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables'
									/>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												reminder_template_1: getTemplateExample(1),
											})
										}
										className='absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800'
									>
										Utiliser un exemple
									</button>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Template deuxième relance
								</label>
								<div className='relative'>
									<textarea
										rows={4}
										value={formData.reminder_template_2}
										onChange={(e) =>
											setFormData({
												...formData,
												reminder_template_2: e.target.value,
											})
										}
										className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables'
									/>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												reminder_template_2: getTemplateExample(2),
											})
										}
										className='absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800'
									>
										Utiliser un exemple
									</button>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Template troisième relance
								</label>
								<div className='relative'>
									<textarea
										rows={4}
										value={formData.reminder_template_3}
										onChange={(e) =>
											setFormData({
												...formData,
												reminder_template_3: e.target.value,
											})
										}
										className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables'
									/>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												reminder_template_3: getTemplateExample(3),
											})
										}
										className='absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800'
									>
										Utiliser un exemple
									</button>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Template relance finale
								</label>
								<div className='relative'>
									<textarea
										rows={4}
										value={formData.reminder_template_final}
										onChange={(e) =>
											setFormData({
												...formData,
												reminder_template_final: e.target.value,
											})
										}
										className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables'
									/>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												reminder_template_final: getTemplateExample(4),
											})
										}
										className='absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800'
									>
										Utiliser un exemple
									</button>
								</div>
							</div>
						</div>

						<div className='flex justify-between space-x-4'>
							{/* <button
								type='button'
								// onClick={onClose}
								disabled={loading}
								className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
							> */}
							<div
								title='Stop sending automatic reminders'
								onClick={handleAutomaticReminderToggle}
							>
								{automaticReminder ? (
									<Pause
										className='cursor-pointer hover:fill-blue-400 stroke-blue-400'
										strokeWidth={2}
									/>
								) : (
									<Play
										className='cursor-pointer hover:fill-blue-400 stroke-blue-400'
										strokeWidth={2}
									/>
								)}
							</div>
							{/* </button> */}
							<div className='flex space-x-4'>
								<button
									type='button'
									onClick={onClose}
									disabled={loading}
									className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
								>
									Annuler
								</button>
								<button
									type='submit'
									disabled={loading}
									className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
								>
									{loading ? 'Enregistrement...' : 'Enregistrer'}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
