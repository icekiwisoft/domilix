import ArticlePostDialog from '@components/ArticlePostDialog/ArticlePostDialog';
import AnnouncerRequiredModal from '@components/AnnouncerRequiredModal/AnnouncerRequiredModal';
import { useState } from 'react';
import { MdOutlineCampaign } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';

export default function FloatingPublishButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAnnouncerRequiredModal, setShowAnnouncerRequiredModal] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleDialog = () => {
    if (!user?.announcer) {
      setShowAnnouncerRequiredModal(true);
      return;
    }

    setIsDialogOpen(!isDialogOpen);
  };

  // Ne pas afficher le bouton si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <button
        className='bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 z-50 rounded-l-2xl ml-auto flex gap-2 items-center fixed right-0 top-1/3 shadow-lg transition-colors'
        onClick={toggleDialog}
        aria-label='Publier une annonce'
      >
        <MdOutlineCampaign size={24} className='-rotate-45' />
        <span className='hidden lg:block text-sm font-medium'>Publier</span>
      </button>

      {isDialogOpen && <ArticlePostDialog toggleDialog={toggleDialog} />}
      {showAnnouncerRequiredModal && (
        <AnnouncerRequiredModal
          onClose={() => setShowAnnouncerRequiredModal(false)}
        />
      )}
    </>
  );
}
