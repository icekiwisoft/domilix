import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HiLockClosed } from 'react-icons/hi2';
import { motion } from 'framer-motion';

interface UnlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  price: number;
}

export default function UnlockDialog({
  isOpen,
  onClose,
  onConfirm,
  price,
}: UnlockDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <div className='flex flex-col items-center mb-6'>
                  <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4'>
                    <img src='/dom.png' alt='domicoin' className='w-10 h-10' />
                  </div>
                  <Dialog.Title
                    as='h3'
                    className='text-2xl font-bold text-gray-900 text-center'
                  >
                    Débloquer cette annonce
                  </Dialog.Title>
                </div>

                <div className='mt-4 text-center'>
                  <p className='text-gray-600 mb-4'>
                    Pour accéder aux coordonnées de l'annonceur et aux
                    informations complètes, vous devez débloquer cette annonce
                    pour
                  </p>
                  <div className='flex items-center justify-center gap-2 mb-6'>
                    <img src='/dom.png' alt='domicoin' className='w-8 h-8' />
                    <span className='text-3xl font-bold text-orange-600'>
                      1
                    </span>
                    <span className='text-lg text-gray-600'>Domicoin</span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    Valable pendant 7 jours
                  </p>
                </div>

                <div className='mt-6 flex gap-4'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all'
                    onClick={onClose}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all'
                    onClick={onConfirm}
                  >
                    <img src='/dom.png' alt='domicoin' className='w-5 h-5' />
                    Débloquer
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
