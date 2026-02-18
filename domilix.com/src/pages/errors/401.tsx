import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiArrowLeft } from 'react-icons/hi2';
import { signinDialogActions } from '@stores/defineStore';

export default function Error401() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    signinDialogActions.toggle();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4'>
      <div className='max-w-2xl w-full'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center'
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6'
          >
            <HiLockClosed className='w-12 h-12 text-orange-600' />
          </motion.div>

          {/* Error Code */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-8xl font-bold text-orange-600 mb-4'
          >
            401
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='text-3xl font-bold text-gray-900 mb-4'
          >
            Accès non autorisé
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='text-gray-600 text-lg mb-8 max-w-md mx-auto'
          >
            Vous devez être connecté pour accéder à cette page. Connectez-vous
            pour continuer.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
          >
            <button
              onClick={handleSignIn}
              className='bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            >
              Se connecter
            </button>

            <button
              onClick={handleGoBack}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors'
            >
              <HiArrowLeft className='w-5 h-5' />
              Retour
            </button>

            <button
              onClick={handleGoHome}
              className='text-orange-600 hover:text-orange-700 font-medium py-3 px-6 rounded-xl hover:bg-orange-50 transition-colors'
            >
              Accueil
            </button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className='mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200'
          >
            <h3 className='font-semibold text-gray-900 mb-3'>
              Pourquoi cette page ?
            </h3>
            <ul className='text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto'>
              <li className='flex items-start gap-2'>
                <span className='text-orange-600 mt-0.5'>•</span>
                <span>
                  Cette ressource nécessite une authentification pour être
                  accessible
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-orange-600 mt-0.5'>•</span>
                <span>
                  Votre session a peut-être expiré, reconnectez-vous pour
                  continuer
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-orange-600 mt-0.5'>•</span>
                <span>
                  Si vous n'avez pas de compte, inscrivez-vous gratuitement
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
