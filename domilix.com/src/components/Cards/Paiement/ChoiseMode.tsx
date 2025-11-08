import React, { useState } from 'react';
import { OfferDetailsProps } from 'utils/types';
import MTN_money from '@assets/img/MTN-Money.png';
import Orange_money from '@assets/img/orange-Money.png';
import Alert from '../Alert/AlertNotifs';
import { Phone } from '@components/Phone/Phone';
import { subscriptionApi } from '@services/subscriptionApi';
import 'react-international-phone/style.css';

const ChoiseMode: React.FC<OfferDetailsProps> = ({
  title,
  credit,
  validity,
  price,
  features,
  onClose,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [phone, setPhone] = useState('+237');

  const paymentMethods = [
    { name: 'MTN Mobile Money', image: MTN_money },
    { name: 'Orange Money', image: Orange_money },
  ];

  const paymentImages: Record<string, string> = {
    'MTN Mobile Money': MTN_money,
    'Orange Money': Orange_money,
  };

  const handlePurchase = async () => {
    if (!selectedPayment) return;

    setIsFetching(true);
    try {
      await subscriptionApi.startCreditPurchase(title, phone, selectedPayment);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePaymentSelect = (method: string) => {
    setSelectedPayment(method);
  };

  const handleBack = () => {
    setSelectedPayment(null);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      {/* Alerts */}
      {showSuccessAlert && (
        <Alert
          type='success'
          message='Votre paiement a été effectué avec succès !'
        />
      )}
      {showErrorAlert && (
        <Alert
          type='error'
          message='Une erreur est survenue lors du paiement.'
        />
      )}

      {/* Modal Container */}
      <div className='bg-white px-6 py-8 lg:p-12 shadow-2xl rounded-xl max-w-[95%] sm:max-w-[80%] lg:max-w-[60%] w-full relative'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
          aria-label='Fermer'
        >
          ✕
        </button>

        {/* Header */}
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-indigo-900 mb-2'>
            Merci de nous faire confiance !
          </h2>
          <p className='text-gray-600 text-sm'>
            Choisissez votre méthode de paiement pour continuer
          </p>
        </div>

        {/* Main Content */}
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          {!selectedPayment ? (
            <>
              {/* Payment Methods */}
              <div className='lg:w-1/3 flex flex-col items-center'>
                <h3 className='text-lg font-semibold text-gray-800 mb-6'>
                  Méthodes de paiement
                </h3>
                <div className='flex flex-row lg:flex-col gap-6'>
                  {paymentMethods.map(method => (
                    <button
                      key={method.name}
                      onClick={() => handlePaymentSelect(method.name)}
                      className='p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:shadow-md transition-all duration-200 group'
                    >
                      <img
                        src={method.image}
                        alt={method.name}
                        className='h-12 lg:h-16 group-hover:scale-105 transition-transform'
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Offer Details */}
              <div className='lg:w-2/3 lg:border-l lg:border-gray-200 lg:pl-8'>
                <div className='bg-gradient-to-br from-indigo-50 to-orange-50 rounded-lg p-6'>
                  <div className='text-center mb-6'>
                    <p className='text-gray-600 text-sm font-medium'>
                      Vous êtes sur le point de profiter de tous les avantages
                      de notre offre !
                    </p>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-lg font-bold text-indigo-900 mb-3'>
                        {title}
                      </h3>
                    </div>

                    <div className='space-y-3'>
                      <div className='flex items-center gap-3 text-sm'>
                        <span className='text-lg'>📈</span>
                        <span className='text-gray-700'>{credit}</span>
                      </div>
                      <div className='flex items-center gap-3 text-sm'>
                        <span className='text-lg'>⏳</span>
                        <span className='text-gray-700'>{validity}</span>
                      </div>
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-3 text-sm'
                        >
                          <span className='text-green-600 font-bold'>✓</span>
                          <span className='text-gray-700'>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className='border-t pt-4 mt-6'>
                      <div className='flex items-center justify-between'>
                        <span className='text-gray-600 font-medium'>
                          Montant total :
                        </span>
                        <span className='text-2xl font-bold text-orange-600'>
                          {price}
                        </span>
                      </div>
                    </div>

                    <div className='bg-orange-100 rounded-lg p-4 mt-4'>
                      <p className='text-orange-700 text-sm text-center'>
                        Sélectionnez votre méthode de paiement pour continuer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Payment Form */
            <div className='w-full animate-slide-up'>
              {/* Back Button */}
              <button
                onClick={handleBack}
                className='flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors'
              >
                ← Retour aux méthodes de paiement
              </button>

              {/* Selected Payment Method */}
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <h3 className='text-sm font-medium text-gray-600 mb-2'>
                  Méthode sélectionnée :
                </h3>
                <div className='flex items-center gap-3'>
                  <img
                    src={paymentImages[selectedPayment]}
                    alt={selectedPayment || ''}
                    className='h-8'
                  />
                  <span className='font-semibold text-orange-600'>
                    {selectedPayment}
                  </span>
                </div>
              </div>

              {/* Phone Input */}
              <div className='mb-6'>
                <label className='block text-gray-700 text-sm font-semibold mb-3'>
                  Numéro de téléphone
                </label>
                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <Phone value={phone} onChange={setPhone} />
                  </div>
                  {isFetching && (
                    <div className='flex-shrink-0'>
                      <div className='w-6 h-6 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin'></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePurchase}
                disabled={isFetching || !phone.trim()}
                className='w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors'
              >
                {isFetching ? 'Traitement en cours...' : 'Payer maintenant'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoiseMode;
