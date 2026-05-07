'use client';

import Logo from '@assets/domilix.png';
import { signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import ProfilePopup from '../ProfilePopup/ProfilePopup';
import NotificationPopup from '../NotificationPopup/NotificationPopup';
import AnnouncerRequiredModal from '@components/AnnouncerRequiredModal/AnnouncerRequiredModal';
import ArticlePostDialog from '@components/ArticlePostDialog/ArticlePostDialog';
import { notificationApi } from '../../services/notificationApi';
import React, { useState, useEffect, useRef } from 'react';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { HiOutlineBell } from 'react-icons/hi';
import { MdCheck, MdOutlineCampaign, MdOutlineInventory2 } from 'react-icons/md';
import { NavLink, useNavigate } from '@router';

const defaultLinks = [
  { name: 'Acheter', url: '/subscriptions' },
  { name: 'Immobiliers', url: '/houses' },
  { name: 'Mobiliers', url: '/furnitures' },
];

type Nav2Props = {
  links?: Array<{ name: string; url: string }>;
  highlightBuyLink?: boolean;
};

export default function Nav2({
  links = defaultLinks,
  highlightBuyLink = false,
}: Nav2Props): React.ReactElement {
  const logoSrc = typeof Logo === 'string' ? Logo : Logo.src;

  const [click, setClick] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showAnnouncerRequiredModal, setShowAnnouncerRequiredModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);

  const userCredits = 0; // TODO: Add credits to User interface when available

  const handlePublishClick = () => {
    if (!user?.announcer) {
      setShowAnnouncerRequiredModal(true);
      return;
    }

    setShowPostDialog(true);
  };

  // Load unread notifications count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const content = (
    <div className='absolute left-0 right-0 top-16 z-40 bg-white text-[#00549f] shadow-2xl lg:hidden'>
      <div className='px-8 py-8'>
        <div className='space-y-7 text-[1.28rem] font-black leading-tight'>
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.url}
              className={({ isActive }) =>
                `flex items-center gap-4 text-left transition-colors ${
                  isActive ? 'text-orange-500' : 'text-[#00549f] hover:text-orange-500'
                }`
              }
              onClick={() => setClick(false)}
            >
              <MdOutlineInventory2 className='h-5 w-5 shrink-0' />
              {link.name}
            </NavLink>
          ))}

          {isAuthenticated && (
            <button
              type='button'
              onClick={() => {
                handlePublishClick();
                setClick(false);
              }}
              className='flex items-center gap-4 text-left text-[#00549f] transition-colors hover:text-orange-500'
            >
              <MdCheck className='h-5 w-5 shrink-0' />
              Publier une annonce
            </button>
          )}

          {isAuthenticated && user && (
            <>
              <div className='h-px bg-blue-100' />

              <NavLink
                to='/favorite'
                className={({ isActive }) =>
                  `block transition-colors ${
                    isActive ? 'text-orange-500' : 'text-[#00549f] hover:text-orange-500'
                  }`
                }
                onClick={() => setClick(false)}
              >
                Mes Favoris
              </NavLink>

              {user.announcer && (
                <NavLink
                  to={`/announcers/${user.announcer}`}
                  className={({ isActive }) =>
                    `block transition-colors ${
                      isActive ? 'text-orange-500' : 'text-[#00549f] hover:text-orange-500'
                    }`
                  }
                  onClick={() => setClick(false)}
                >
                  Mon Compte Annonceur
                </NavLink>
              )}

              {user.is_admin && (
                <NavLink
                  to='/dashboard'
                  className={({ isActive }) =>
                    `block transition-colors ${
                      isActive ? 'text-orange-500' : 'text-[#00549f] hover:text-orange-500'
                    }`
                  }
                  onClick={() => setClick(false)}
                >
                  Dashboard
                </NavLink>
              )}

              <button
                type='button'
                onClick={() => {
                  navigate('/settings');
                  setClick(false);
                }}
                className='block text-left text-[#00549f] transition-colors hover:text-orange-500'
              >
                Paramètres
              </button>
            </>
          )}
        </div>

        <div className='mt-8 border-t border-blue-100 pt-6'>
          {!isAuthenticated ? (
            <button
              type='button'
              onClick={() => {
                signinDialogActions.toggle();
                setClick(false);
              }}
              className='w-full rounded-2xl border border-orange-400 bg-white px-6 py-4 text-base font-black text-orange-600 shadow-sm transition-colors hover:bg-orange-50'
            >
              Se connecter
            </button>
          ) : (
            <button
              type='button'
              onClick={() => {
                logout();
                setClick(false);
              }}
              className='w-full rounded-2xl border border-red-200 px-6 py-4 text-base font-black text-red-500 transition-colors hover:bg-red-50'
            >
              Se déconnecter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <nav className='bg-white navbar top-0 left-0 fixed w-full px-4 sm:px-6 lg:px-10 z-50 shadow-sm'>
      <div className='h-16 flex justify-between items-center text-black max-w-7xl mx-auto'>
        <div className='flex items-center flex-shrink-0' data-tour='nav-logo'>
          <NavLink className='text-2xl font-bold flex' to='/'>
            <img src={logoSrc} alt='logo' className='h-6 sm:h-7' />
          </NavLink>
        </div>

        {/* Menu Desktop */}
        <div className='hidden lg:flex items-center space-x-6'>
          <ul className='flex items-center space-x-6 xl:space-x-8' data-tour='nav-links'>
            {links.map(link => (
              <li key={link.name}>
                <NavLink
                  to={link.url}
                  className={({ isActive }) =>
                    highlightBuyLink && link.name === 'Acheter'
                      ? `inline-flex items-center rounded-full border border-pink-500 bg-pink-500 px-3 py-1 font-bold text-white shadow-sm -translate-y-px text-sm xl:text-base whitespace-nowrap transition-all ${
                          isActive
                            ? 'ring-2 ring-pink-200'
                            : 'hover:bg-pink-600 hover:border-pink-600 hover:shadow'
                        }`
                      : isActive
                        ? 'text-black font-bold underline decoration-2 underline-offset-4 text-sm xl:text-base'
                        : 'text-gray-700 hover:text-gray-900 transition-colors text-sm xl:text-base whitespace-nowrap'
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {!isAuthenticated ? (
            <button
              onClick={signinDialogActions.toggle}
              className='whitespace-nowrap rounded-full border border-orange-400 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm transition-colors hover:bg-orange-50 xl:px-6 xl:text-base'
            >
              Se connecter
            </button>
          ) : (
            <div className='flex items-center space-x-3 xl:space-x-4'>
              <button
                onClick={handlePublishClick}
                data-tour='publish-ad'
                className='inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-orange-400 bg-white px-3 py-2 text-sm font-semibold text-orange-600 shadow-sm transition-colors hover:bg-orange-50 xl:px-4'
                aria-label='Publier une annonce'
              >
                <MdOutlineCampaign className='text-base -rotate-12 text-orange-600' />
                <span className='hidden xl:inline'>Publier</span>
              </button>

              <NavLink
                to='/subscriptions'
                data-tour='user-credits'
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors ${
                    isActive ? 'text-yellow-900' : 'hover:opacity-80'
                  }`
                }
              >
                <img
                  src='/dom.png'
                  alt='coin'
                  className='w-5 h-5 xl:w-6 xl:h-6'
                />
                <span className='text-sm xl:text-base text-yellow-900 font-semibold'>
                  {userCredits}
                </span>
              </NavLink>

              {/* Notifications */}
              <div className='relative'>
                <button
                  ref={notificationButtonRef}
                  onClick={() => {
                    setShowNotifications(prev => !prev);
                    setShowProfileMenu(false);
                  }}
                  className='relative w-9 h-9 xl:w-10 xl:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <HiOutlineBell className='w-5 h-5 xl:w-6 xl:h-6 text-gray-700' />
                  {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPopup
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <div className='relative'>
                <button
                  ref={profileButtonRef}
                  onClick={event => {
                    event.stopPropagation();
                    setShowProfileMenu(prev => !prev);
                    setShowNotifications(false);
                  }}
                  className='w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm xl:text-base font-semibold'
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {showProfileMenu && (
                  <ProfilePopup
                    ref={profileMenuRef}
                    user={user}
                    onClose={() => setShowProfileMenu(false)}
                    dashboardHref='/dashboard'
                    announcerHref={user?.announcer ? `/announcers/${user.announcer}` : undefined}
                    favoritesHref='/favorite'
                    subscriptionsHref='/settings?tab=packs'
                    onOpenSettings={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    onLogout={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {/* Mobile Menu */}
        <div className='flex lg:hidden items-center space-x-2 sm:space-x-3'>
          {isAuthenticated && (
            <>
              <button
                onClick={handlePublishClick}
                data-tour='publish-ad'
                className='inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-orange-400 bg-white text-orange-600 shadow-sm transition-colors hover:bg-orange-50'
                aria-label='Publier une annonce'
              >
                <MdOutlineCampaign className='w-4 h-4 sm:w-5 sm:h-5 -rotate-12 text-orange-600' />
              </button>

              <NavLink
                to='/subscriptions'
                data-tour='user-credits'
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 transition-colors ${
                    isActive ? 'text-yellow-900' : 'hover:opacity-80'
                  }`
                }
              >
                <img
                  src='/dom.png'
                  alt='coin'
                  className='w-5 h-5 sm:w-6 sm:h-6'
                />
                <span className='text-sm sm:text-base font-semibold text-yellow-800'>
                  {userCredits}
                </span>
              </NavLink>

              {/* Notifications Mobile */}
              <div className='relative'>
                <button
                  ref={notificationButtonRef}
                  onClick={() => {
                    setShowNotifications(prev => !prev);
                    setShowProfileMenu(false);
                  }}
                  className='relative w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <HiOutlineBell className='w-5 h-5 sm:w-6 sm:h-6 text-gray-700' />
                  {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center'>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPopup
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <div className='relative'>
                <button
                  ref={profileButtonRef}
                  onClick={event => {
                    event.stopPropagation();
                    setShowProfileMenu(prev => !prev);
                    setShowNotifications(false);
                  }}
                  className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm sm:text-base font-semibold'
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {showProfileMenu && (
                  <ProfilePopup
                    ref={profileMenuRef}
                    user={user}
                    onClose={() => setShowProfileMenu(false)}
                    dashboardHref='/dashboard'
                    announcerHref={user?.announcer ? `/announcers/${user.announcer}` : undefined}
                    favoritesHref='/favorite'
                    subscriptionsHref='/settings?tab=packs'
                    onOpenSettings={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    onLogout={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                  />
                )}
              </div>
            </>
          )}

          <button
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            onClick={handleClick}
            aria-label={click ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {click ? (
              <HiXMark className='text-2xl sm:text-3xl' />
            ) : (
              <HiBars3 className='text-2xl sm:text-3xl' />
            )}
          </button>
        </div>
      </div>
      {click && content}

      {showPostDialog && (
        <ArticlePostDialog toggleDialog={() => setShowPostDialog(false)} />
      )}
      {showAnnouncerRequiredModal && (
        <AnnouncerRequiredModal
          onClose={() => setShowAnnouncerRequiredModal(false)}
        />
      )}
    </nav>
  );
}
