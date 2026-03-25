import React, { useState } from 'react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-3'>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Nom complet</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='text'
                placeholder='John Doe'
              />
            </div>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Email</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='email'
                placeholder='john.doe@example.com'
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className='space-y-3'>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Téléphone</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='tel'
                placeholder='+33 6 12 34 56 78'
              />
            </div>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Adresse</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='text'
                placeholder='123 rue Example'
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className='space-y-3'>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Mot de passe</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='password'
                placeholder='••••••••'
              />
            </div>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Confirmation du mot de passe</label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='password'
                placeholder='••••••••'
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <section className='bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center px-4'>
        <div className='max-w-md w-full mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg space-y-6'>
          {/* Stepper */}
          <div className='flex justify-center items-center mb-6'>
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm
                  ${step >= num
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'}`}>
                  {num}
                </div>
                {num < totalSteps && (
                  <div className={`w-12 h-0.5 mx-1 
                    ${step > num ? 'bg-orange-500' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>
              Bienvenue sur DOMILIX
            </h2>
            <p className='text-gray-600 text-sm'>
              Créez votre compte en quelques étapes
            </p>
          </div>

          <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}

            <div className='flex gap-3 pt-4'>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className='flex-1 py-2 px-4 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all duration-200'
                >
                  Précédent
                </button>
              )}

              <button
                onClick={() => step < totalSteps ? setStep(step + 1) : null}
                className='flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-all duration-200'
              >
                {step === totalSteps ? 'Créer mon compte' : 'Suivant'}
              </button>
            </div>

            <div className='text-center pt-2'>
              <span className='text-gray-600 text-sm'>
                Déjà un compte ?{' '}
                <a className='text-orange-500 hover:text-orange-600 font-medium' href='/login'>
                  Connectez-vous
                </a>
              </span>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
