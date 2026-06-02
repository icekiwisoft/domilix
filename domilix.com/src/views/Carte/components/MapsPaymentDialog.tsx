'use client';

import { useState } from 'react';

import MTN_money from '@assets/img/MTN-Money.png';
import Orange_money from '@assets/img/orange-Money.png';
import { Phone } from '@components/Phone/Phone';
import { subscribeMaps } from '@services/mapsApi';

interface MapsPaymentDialogProps {
  planId: string;
  planLabel: string;
  planPrice: number;
  packDuration: string;
  packUnlockCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MapsPaymentDialog({
  planId,
  planLabel,
  planPrice,
  packDuration,
  packUnlockCount,
  onClose,
  onSuccess,
}: MapsPaymentDialogProps) {
  const mtnSrc = typeof MTN_money === 'string' ? MTN_money : MTN_money.src;
  const orangeSrc = typeof Orange_money === 'string' ? Orange_money : Orange_money.src;

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phone, setPhone] = useState('+237');
  const [isFetching, setIsFetching] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const paymentMethods = [
    { name: 'MTN Mobile Money', value: 'mtn', image: mtnSrc },
    { name: 'Orange Money', value: 'orange', image: orangeSrc },
  ];

  const paymentImages: Record<string, string> = {
    'MTN Mobile Money': mtnSrc,
    'Orange Money': orangeSrc,
  };

  const handlePay = async () => {
    if (!selectedMethod) return;
    setIsFetching(true);
    setErrorMsg(null);
    try {
      await subscribeMaps(planId, selectedMethod, phone);
      setSuccessMsg('Demande de paiement envoyée. Validez la transaction sur votre téléphone.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch {
      setErrorMsg('Une erreur est survenue lors du paiement.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fermer"
        >
          ✕
        </button>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mb-6 text-center">
          <h2 className="text-xl font-black text-gray-950">Paiement abonnement Maps</h2>
          <p className="mt-1 text-sm text-gray-500">Choisissez votre méthode de paiement</p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">{planLabel}</p>
              <p className="text-xs text-gray-500">{packDuration}</p>
            </div>
            <p className="text-lg font-black text-[#E8921A]">{planPrice.toLocaleString()} FCFA</p>
          </div>
          {packUnlockCount > 0 && (
            <p className="mt-2 text-xs text-gray-500">{packUnlockCount} déblocage{packUnlockCount > 1 ? 's' : ''} de contact inclus</p>
          )}
        </div>

        {!selectedMethod ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">Méthodes de paiement</p>
            <div className="flex gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className="rounded-xl border-2 border-gray-200 p-4 transition hover:border-[#E8921A] hover:shadow-md"
                >
                  <img src={method.image} alt={method.name} className="h-12" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedMethod(null)}
              className="mb-4 flex items-center gap-1 text-sm font-bold text-[#E8921A] transition hover:text-orange-600"
            >
              ← Retour
            </button>

            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Méthode sélectionnée :</p>
              <div className="flex items-center gap-2">
                <img
                  src={paymentImages[selectedMethod === 'mtn' ? 'MTN Mobile Money' : 'Orange Money']}
                  alt={selectedMethod || ''}
                  className="h-7"
                />
                <span className="text-sm font-bold text-[#E8921A]">
                  {selectedMethod === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Numéro de téléphone</label>
              <Phone value={phone} onChange={setPhone} />
            </div>

            <button
              onClick={handlePay}
              disabled={isFetching || !phone.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-[#E8921A] to-orange-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:from-orange-500 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetching ? 'Traitement en cours...' : `Payer ${planPrice.toLocaleString()} FCFA`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
