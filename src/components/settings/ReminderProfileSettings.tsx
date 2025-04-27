import React, { useEffect, useState } from 'react';
import { ReminderProfile } from '../../types/database';
import { AlertCircle, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DelayInputJHM from './DelayInputJHM';
import { Disclosure } from '@headlessui/react';
import { ChevronUp } from 'lucide-react';

const ReminderProfileSettings = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({
		profile1: {
		  id: undefined,
		  delay1: { j: 0, h: 0, m: 0 },
		  delay2: { j: 0, h: 0, m: 0 },
		  delay3: { j: 0, h: 0, m: 0 },
		  delay4: { j: 0, h: 0, m: 0 },
		},
		profile2: {
		  id: undefined,
		  delay1: { j: 0, h: 0, m: 0 },
		  delay2: { j: 0, h: 0, m: 0 },
		  delay3: { j: 0, h: 0, m: 0 },
		  delay4: { j: 0, h: 0, m: 0 },
		},
		profile3: {
		  id: undefined,
		  delay1: { j: 0, h: 0, m: 0 },
		  delay2: { j: 0, h: 0, m: 0 },
		  delay3: { j: 0, h: 0, m: 0 },
		  delay4: { j: 0, h: 0, m: 0 },
		},
	  });
	  
	// const [reminderProfiles, setReminderProfiles] = useState<ReminderProfile[]>()

	const fetchAndSetProfiles = async () => {
		setSaving(true);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Utilisateur non authentifié');

		const { data, error } = await supabase
			.from('reminder_profile')
			.select('*')
			.eq('owner_id', user.id);

		if (error) {
			setError(error.message);
		}

		setUserId(user.id);
		if (data === null) return;

		const firstProfile = data.find(
			(profile: ReminderProfile) => profile.name === 'Profile 1'
		);
		const secondProfile = data.find(
			(profile: ReminderProfile) => profile.name === 'Profile 2'
		);
		const thirdProfile = data.find(
			(profile: ReminderProfile) => profile.name === 'Profile 3'
		);

		setFormData({
			profile1: {
				id: firstProfile?.id,
				delay1: firstProfile?.delay1 ?? 0,
				delay2: firstProfile?.delay2 ?? 0,
				delay3: firstProfile?.delay3 ?? 0,
				delay4: firstProfile?.delay4 ?? 0,
			},
			profile2: {
				id: secondProfile?.id,
				delay1: secondProfile?.delay1 ?? 0,
				delay2: secondProfile?.delay2 ?? 0,
				delay3: secondProfile?.delay3 ?? 0,
				delay4: secondProfile?.delay4 ?? 0,
			},
			profile3: {
				id: thirdProfile?.id,
				delay1: thirdProfile?.delay1 ?? 0,
				delay2: thirdProfile?.delay2 ?? 0,
				delay3: thirdProfile?.delay3 ?? 0,
				delay4: thirdProfile?.delay4 ?? 0,
			},
		});
		setSaving(false);
	};

	useEffect(() => {
		fetchAndSetProfiles();
	}, []);

	type ProfileKey = 'profile1' | 'profile2' | 'profile3';
	type DelayKey = 'delay1' | 'delay2' | 'delay3' | 'delay4';
	
	type DelayValue = { j: number; h: number; m: number };
	
	const handleInputOnBlur = (
	  profile: ProfileKey,
	  delay: DelayKey,
	  value: DelayValue
	) => {
	  setFormData((prevFormData) => ({
		...prevFormData,
		[profile]: {
		  ...prevFormData[profile],
		  [delay]: value,
		},
	  }));
	};
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		if (userId === null) return;
		if (formData.profile1.id === undefined) {
			// Then this is a new profile
			const prepareData: ReminderProfile[] = [
				{
					name: 'Profile 1',
					delay1: formData.profile1.delay1,
					delay2: formData.profile1.delay2,
					delay3: formData.profile1.delay3,
					delay4: formData.profile1.delay4,
					owner_id: userId,
					public: false,
				},
				{
					name: 'Profile 2',
					delay1: formData.profile2.delay1,
					delay2: formData.profile2.delay2,
					delay3: formData.profile2.delay3,
					delay4: formData.profile2.delay4,
					owner_id: userId,
					public: false,
				},
				{
					name: 'Profile 3',
					delay1: formData.profile3.delay1,
					delay2: formData.profile3.delay2,
					delay3: formData.profile3.delay3,
					delay4: formData.profile3.delay4,
					owner_id: userId,
					public: false,
				},
			];
			const { error } = await supabase
				.from('reminder_profile')
				.insert(prepareData);
			if (error) {
				setError(error.message);
			}
		} else {
			const prepareData: ReminderProfile[] = [
				{
					id: formData.profile1.id,
					name: 'Profile 1',
					delay1: formData.profile1.delay1,
					delay2: formData.profile1.delay2,
					delay3: formData.profile1.delay3,
					delay4: formData.profile1.delay4,
					owner_id: userId,
					public: false,
				},
				{
					id: formData.profile2.id,
					name: 'Profile 2',
					delay1: formData.profile2.delay1,
					delay2: formData.profile2.delay2,
					delay3: formData.profile2.delay3,
					delay4: formData.profile2.delay4,
					owner_id: userId,
					public: false,
				},
				{
					id: formData.profile3.id,
					name: 'Profile 3',
					delay1: formData.profile3.delay1,
					delay2: formData.profile3.delay2,
					delay3: formData.profile3.delay3,
					delay4: formData.profile3.delay4,
					owner_id: userId,
					public: false,
				},
			];
			const { error: error1 } = await supabase
				.from('reminder_profile')
				.update(prepareData[0])
				.eq('id', prepareData[0].id);

			const { error: error2 } = await supabase
				.from('reminder_profile')
				.update(prepareData[1])
				.eq('id', prepareData[1].id);

			const { error: error3 } = await supabase
				.from('reminder_profile')
				.update(prepareData[2])
				.eq('id', prepareData[2].id);
			if (error1) {
				setError(error1?.message);
				return;
			}
			if (error2) {
				setError(error2?.message);
				return;
			}
			if (error3) {
				setError(error3?.message);
				return;
			}
			setSuccess(true);
		}
		// Refetch the data to make sure its up to date
		await fetchAndSetProfiles();
		setSaving(false);
	};
	return (
		<div>
			<h2 className='text-xl font-bold mb-6'>Profil utilisateur</h2>

			{error && (
				<div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center'>
					<AlertCircle className='h-5 w-5 mr-2' />
					{error}
				</div>
			)}
			{success && (
				<div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700'>
					Profil de rappel mis à jour avec succès
				</div>
			)}

			<form onSubmit={handleSubmit} className='space-y-4'>

			{[1, 2, 3].map((n) => (
  <Disclosure key={n}>
    {({ open }) => (
      <div className='border rounded-md'>
        <Disclosure.Button className='flex justify-between w-full px-4 py-2 text-left text-sm font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-t-md'>
          <span>Profil {n}</span>
          <ChevronUp className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Disclosure.Button>
        <Disclosure.Panel className='px-4 pt-4 pb-2 text-sm text-gray-700'>
          <div className='grid grid-cols-5 gap-6 items-center'>
            {['delay1', 'delay2', 'delay3', 'delay4'].map((delayKey, i) => (
              <DelayInputJHM
                key={delayKey}
                label={`Délai ${['première', 'deuxième', 'troisième', 'relance finale'][i]} (Jours,Heures,Minutes)`}
                value={{
                  j: formData[`profile${n}`][delayKey].j,
                  h: formData[`profile${n}`][delayKey].h,
                  m: formData[`profile${n}`][delayKey].m,
                }}
                onChange={(val) => handleInputOnBlur(`profile${n}`, delayKey, val)}
                disabled={saving}
              />
            ))}
          </div>
        </Disclosure.Panel>
      </div>
    )}
  </Disclosure>
))}


				<div className='flex justify-end pt-4'>
					<button
						type='submit'
						disabled={saving}
						className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
					>
						<Save className='h-5 w-5 mr-2' />
						{saving ? 'Enregistrement...' : 'Enregistrer'}
					</button>
				</div>
			</form>
		</div>
	);
};


export default ReminderProfileSettings;
