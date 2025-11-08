import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { motion } from 'framer-motion';

interface SignalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => void;
}

const SIGNAL_REASONS = [
    "Annonce frauduleuse",
    "Prix incorrect",
    "Photos trompeuses",
    "Localisation incorrecte",
    "Contenu inapproprié",
    "Autre"
];

export default function SignalDialog({ isOpen, onClose, onSubmit }: SignalDialogProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [details, setDetails] = useState("");

    const handleSubmit = () => {
        onSubmit(selectedReason, details);
        setSelectedReason("");
        setDetails("");
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center mb-6">
                                    <HiExclamationTriangle className="w-8 h-8 text-red-500 mr-3" />
                                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                        Signaler l'annonce
                                    </Dialog.Title>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Motif du signalement
                                    </label>
                                    <select
                                        value={selectedReason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                    >
                                        <option value="">Sélectionnez un motif</option>
                                        {SIGNAL_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Détails supplémentaires
                                    </label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                        placeholder="Décrivez le problème..."
                                    />
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                                        onClick={onClose}
                                    >
                                        Annuler
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all"
                                        onClick={handleSubmit}
                                        disabled={!selectedReason}
                                    >
                                        Signaler
                                    </motion.button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
} 