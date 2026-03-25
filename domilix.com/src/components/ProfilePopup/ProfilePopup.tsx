'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { GoX } from 'react-icons/go';

type ProfilePopupProps = {
  user: any;
  onClose: () => void;
  dashboardHref?: string;
  announcerHref?: string;
  favoritesHref: string;
  subscriptionsHref: string;
  onOpenSettings: () => void;
  onLogout: () => void;
};

const itemClassName =
  'block w-full rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-gray-50';

const ProfilePopup = React.forwardRef<HTMLDivElement, ProfilePopupProps>(
  (
    {
      user,
      onClose,
      dashboardHref,
      announcerHref,
      favoritesHref,
      subscriptionsHref,
      onOpenSettings,
      onLogout,
    },
    ref,
  ) => {
    const router = useRouter();

    const navigateTo = (
      href: string,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      router.push(href);
      onClose();
    };

    return (
      <div
        ref={ref}
        className='absolute right-0 mt-2 z-[60] w-80 max-w-[90vw] rounded-xl border bg-white p-4 shadow-xl animate-in slide-in-from-top-2 duration-200'
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex min-w-0 flex-1 items-center space-x-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200'>
              <span className='text-sm font-semibold'>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-gray-900'>
                {user?.name || 'Utilisateur'}
              </p>
              <p className='truncate text-xs text-gray-600'>{user?.email}</p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-gray-100'
            aria-label='Fermer le menu'
          >
            <GoX className='text-lg' />
          </button>
        </div>

        <div className='space-y-1 border-t pt-3'>
          {user?.is_admin && dashboardHref && (
            <button
              type='button'
              onClick={event => navigateTo(dashboardHref, event)}
              className={itemClassName}
            >
              Dashboard
            </button>
          )}

          {user?.announcer && announcerHref && (
            <button
              type='button'
              onClick={event => navigateTo(announcerHref, event)}
              className={itemClassName}
            >
              Mon Compte Annonceur
            </button>
          )}

          <button
            type='button'
            onClick={event => navigateTo(favoritesHref, event)}
            className={itemClassName}
          >
            Mes Favoris
          </button>

          <button
            type='button'
            onClick={event => navigateTo(subscriptionsHref, event)}
            className={itemClassName}
          >
            Mes Abonnements
          </button>

          <button type='button' onClick={onOpenSettings} className={itemClassName}>
            Parametres
          </button>

          <div className='mt-2 border-t pt-2'>
            <button
              type='button'
              onClick={onLogout}
              className='block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50'
            >
              Se deconnecter
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ProfilePopup.displayName = 'ProfilePopup';

export default ProfilePopup;
