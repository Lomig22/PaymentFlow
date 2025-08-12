import {
	MoreVertical,
	Edit,
	Mail,
	Info,
	Clock,
	Trash2,
	ListRestart,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Receivable, Client } from '../../types/database';
import React from 'react';

interface ActionsDropdownProps {
  receivable: Receivable & { client: Client };
  setShowEditForm: (show: boolean) => void;
  setSelectedReceivable: (receivable: Receivable & { client: Client }) => void;
  setShowConfirmReminder: (show: boolean) => void;
  setSelectedClient: (client: Client) => void;
  setShowSettings: (show: boolean) => void;
  setShowReminderHistory: (show: boolean) => void;
  handleDeleteClick: (receivable: Receivable & { client: Client }) => void;
}

export function ActionsDropdown({
  receivable,
  setShowEditForm,
  setSelectedReceivable,
  setShowConfirmReminder,
  setSelectedClient,
  setShowSettings,
  setShowReminderHistory,
  handleDeleteClick,
}: ActionsDropdownProps) {
	const [open, setOpen] = useState(false);
	const [openUpwards, setOpenUpwards] = useState(false);
	const buttonRef = React.useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (open && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;

			// Si moins de 200px en dessous et assez de place au-dessus
			setOpenUpwards(spaceBelow < 200 && spaceAbove > 200);

			// Scroll dans la vue si nécessaire
			buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [open]);

	return (
		<div className="relative inline-block text-left">
			<button
				ref={buttonRef}
				onClick={() => setOpen(!open)}
				className="text-gray-600 hover:text-gray-800"
			>
				<MoreVertical className="h-5 w-5" />
			</button>

			{open && (
				<div
					className={`fixed w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-[60] ${
						openUpwards ? 'bottom-full mb-2' : 'mt-2'
					}`}
				>
					<div className="py-1">
						<button
							onClick={() => {
								setShowEditForm(true);
								setSelectedReceivable(receivable);
								setOpen(false);
							}}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						>
							<Edit className="w-4 h-4 mr-2" /> Modifier
						</button>
						{receivable.status !== 'paid' && (
							<>
								<button
									onClick={() => {
										setSelectedReceivable(receivable);
										setShowConfirmReminder(true);
										setOpen(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-100"
								>
									<Mail className="w-4 h-4 mr-2" /> Relancer (personnaliser l'email) // Ouvre la popup de personnalisation
								</button>
								{!receivable.client?.reminder_template_1 &&
									receivable.client?.needs_reminder && (
										<div className="flex items-center px-4 py-2 text-sm text-yellow-500 cursor-help">
											<Info className="w-4 h-4 mr-2" />
											<span>Paramètres non configurés</span>
										</div>
									)}
							</>
						)}
						<button
							onClick={() => {
								setSelectedClient(receivable.client);
								setSelectedReceivable(receivable);
								setShowSettings(true);
								setOpen(false);
							}}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
						>
							<Clock className="w-4 h-4 mr-2" /> Paramètres de relance
						</button>
						<button
							onClick={() => {
								setSelectedReceivable(receivable);
								setShowReminderHistory(true);
								setOpen(false);
							}}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
						>
							<ListRestart className="w-4 h-4 mr-2" /> Historique des relances
						</button>
						<button
							onClick={() => {
								handleDeleteClick(receivable);
								setOpen(false);
							}}
							className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
						>
							<Trash2 className="w-4 h-4 mr-2" /> Supprimer
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
