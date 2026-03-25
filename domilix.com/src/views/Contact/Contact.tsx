import { useState } from 'react';
import ProfileDialog from '../../components/ProfileDialog/ProfileDialog';
import Footer2 from '../../components/Footer2/Footer2';

export default function Contact() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>
            Page de Contact
          </h1>
          <button
            onClick={() => setShowDialog(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
          >
            Tester ProfileDialog
          </button>

          <ProfileDialog
            isOpen={showDialog}
            onClose={() => setShowDialog(false)}
          />
        </div>
      </div>
      <Footer2 />
    </>
  );
}
