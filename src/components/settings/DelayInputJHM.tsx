import React from 'react'

type Delay = {
	j: number
	h: number
	m: number
}

interface DelayInputJHMProps {
	label: string
	value: Delay
	onChange: (value: Delay) => void
	disabled?: boolean
}

const DelayInputJHM: React.FC<DelayInputJHMProps> = ({
	label,
	value,
	onChange,
	disabled = false,
}) => {
	const handleChange = (key: keyof Delay, val: string) => {
		const parsed = parseInt(val)
		const updatedValue = {
			...value,
			[key]: isNaN(parsed) ? 0 : parsed,
		}
		onChange(updatedValue)
	}

	return (
		<div>
			<label className='text-sm block mb-1'>{label} <span className='text-xs text-gray-500'>(Jours, Heures, Minutes)</span></label>
			<div className='flex gap-2'>
				<input
					type='number'
					min='0'
					placeholder='Jours'
					disabled={disabled}
					value={value.j}
					onChange={(e) => handleChange('j', e.target.value)}
					className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
				<input
					type='number'
					min='0'
					max='23'
					placeholder='Heures'
					disabled={disabled}
					value={value.h}
					onChange={(e) => handleChange('h', e.target.value)}
					className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
				<input
					type='number'
					min='0'
					max='59'
					placeholder='Minutes'
					disabled={disabled}
					value={value.m}
					onChange={(e) => handleChange('m', e.target.value)}
					className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>
		</div>
	)
}

export default DelayInputJHM
