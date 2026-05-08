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
import { HiBars3, HiXMark, HiBell } from 'react-icons/hi2';
import { MdOutlineCampaign } from 'react-icons/md';
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
  const profileButtonDesktopRef = useRef<HTMLButtonElement>(null);
  const profileButtonMobileRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const userCredits = 0; // TODO: Add credits to User interface when available

  const handlePublishClick = () => {
    if (!user?.announcer) {
      setShowAnnouncerRequiredModal(true);
      return;
    }
    setShowPostDialog(true);
  };

  // Body scroll lock while mobile drawer is open
  useEffect(() => {
    if (click) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [click]);

  // Close drawer on ESC and on resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setClick(false);
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setClick(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent
    }
  };

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3.5 px-4 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-surface-container text-primary font-semibold border-l-2 border-primary'
        : 'text-on-surface hover:bg-surface-container-low'
    }`;

  const mobileBuyLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary border border-primary transition-colors ${
      isActive ? 'ring-2 ring-primary/30' : 'hover:opacity-90'
    }`;

  return (
    <nav className='bg-surface navbar top-0 left-0 fixed w-full px-4 sm:px-6 lg:px-10 z-50 shadow-sm border-b border-outline-variant'>
      <div className='h-20 flex justify-between items-center text-on-surface max-w-container mx-auto'>
        <div className='flex items-center flex-shrink-0'>
          <NavLink className='text-2xl font-bold flex' to='/' data-tour='nav-logo'>
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
                      ? `inline-flex items-center rounded-full border border-pink-500 bg-pink-500 px-3 py-1 font-bold text-white shadow-sm -translate-y-px text-sm xl:text-base whitespace-nowrap transition-all ${isActive
                        ? 'ring-2 ring-pink-200'
                        : 'hover:bg-pink-600 hover:border-pink-600 hover:shadow'
                      }`
                      : isActive
                        ? 'text-primary border-b-2 border-primary pb-1 text-body-md font-semibold'
                        : 'text-on-surface-variant hover:text-primary transition-colors text-body-md whitespace-nowrap'
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
              className='whitespace-nowrap rounded-full border border-outline bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container-low xl:px-6 xl:text-base'
            >
              Se connecter
            </button>
          ) : (
          <>
            {/* Domicoins */}
            <NavLink
              to='/subscriptions'
              data-tour='user-credits'
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${isActive ? 'bg-yellow-50' : 'hover:bg-gray-100'
                }`
              }
            >
              <img src='/dom.png' alt='coin' className='w-5 h-5' />
              <span className='text-sm font-semibold text-primary'>{userCredits}</span>
            </NavLink>

            {/* Publier CTA */}
            <button
              onClick={handlePublishClick}
              data-tour='publish-ad'
              className='inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition-opacity hover:opacity-90'
              aria-label='Publier une annonce'
            >
              <MdOutlineCampaign className='-rotate-12 text-base' />
              Publier
            </button>

            {/* Bell */}
            <div className='relative'>
              <button
                onClick={() => { setShowNotifications(prev => !prev); setShowProfileMenu(false); }}
                className='relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low'
                aria-label='Notifications'
              >
                <HiBell className='h-5 w-5 text-on-surface-variant' />
                {unreadCount > 0 && (
                  <span className='absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Avatar */}
            <div className='relative'>
              <button
                ref={profileButtonDesktopRef}
                onClick={e => { e.stopPropagation(); setShowProfileMenu(prev => !prev); setShowNotifications(false); }}
                className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary transition-colors hover:bg-primary/25'
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
                  onOpenSettings={() => { navigate('/settings'); setShowProfileMenu(false); }}
                  onLogout={() => { logout(); setShowProfileMenu(false); }}
                />
              )}
            </div>
          </>
          )}
        </div>

        {/* ── Mobile right cluster ── */}
        <div className='flex lg:hidden items-center gap-1.5'>
          {isAuthenticated && (
            <>
              <button
                onClick={handlePublishClick}
                className='inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-container text-on-primary-container shadow-sm transition-opacity hover:opacity-90'
                aria-label='Publier une annonce'
              >
                <MdOutlineCampaign className='w-4 h-4 sm:w-5 sm:h-5 -rotate-12' />
              </button>

              <NavLink
                to='/subscriptions'
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${isActive ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                  }`
                }
              >
                <img
                  src='/dom.png'
                  alt='coin'
                  className='w-5 h-5 sm:w-6 sm:h-6'
                />
                <span className='text-sm sm:text-base font-semibold text-primary'>
                  {userCredits}
                </span>
              </NavLink>

              {/* Notifications Mobile */}
              <div className='relative'>
                <button
                  onClick={() => { setShowNotifications(prev => !prev); setShowProfileMenu(false); }}
                  className='relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low'
                  aria-label='Notifications'
                >
                  <HiBell className='h-5 w-5 text-on-surface-variant' />
                  {unreadCount > 0 && (
                    <span className='absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white'>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Avatar mobile */}
              <div className='relative'>
                <button
                  ref={profileButtonMobileRef}
                  onClick={e => { e.stopPropagation(); setShowProfileMenu(prev => !prev); setShowNotifications(false); }}
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary transition-colors hover:bg-primary/25'
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
                    onOpenSettings={() => { navigate('/settings'); setShowProfileMenu(false); }}
                    onLogout={() => { logout(); setShowProfileMenu(false); }}
                  />
                )}
              </div>
            </>
          )}

          <button
            className='flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-container-low'
            onClick={() => setClick(c => !c)}
            aria-label={click ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {click ? (
              <HiXMark className='h-5 w-5 text-on-surface' />
            ) : (
              <HiBars3 className='h-5 w-5 text-on-surface' />
            )}
          </button>
        </div>
      </div>
      {/* ── Mobile drawer ── */}
      {click && (
        <div className='lg:hidden absolute top-20 left-0 right-0 z-40 bg-surface border-t border-outline-variant shadow-lg overflow-y-auto max-h-[calc(100vh-5rem)]'>
          <div className='px-4 py-6 max-w-container mx-auto space-y-6'>

            {/* User card */}
            {isAuthenticated && user && (
              <div className='pb-5 border-b border-outline-variant'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center'>
                    <span className='text-base font-semibold text-on-surface'>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-on-surface text-sm truncate'>
                      {user.name || 'Utilisateur'}
                    </p>
                    <p className='text-xs text-on-surface-variant truncate'>{user.email}</p>
                  </div>
                </div>

                <div className='flex items-center justify-center gap-2 bg-primary/10 rounded-xl p-3'>
                  <img src='/dom.png' alt='coin' className='w-5 h-5' />
                  <span className='font-bold text-primary text-sm'>{userCredits} Domicoins</span>
                </div>

                <button
                  onClick={() => { handlePublishClick(); setClick(false); }}
                  className='mt-3 w-full rounded-xl bg-primary-container px-4 py-3 text-sm font-semibold text-on-primary-container transition-opacity hover:opacity-90'
                >
                  <MdOutlineCampaign className='inline -rotate-12 mr-1.5 -mt-0.5' />
                  Publier une annonce
                </button>
              </div>
            )}

            {/* Main nav links */}
            <ul className='space-y-1'>
              {links.map(link => (
                <li key={link.name}>
                  <NavLink
                    to={link.url}
                    className={
                      highlightBuyLink && link.name === 'Acheter'
                        ? mobileBuyLinkClass
                        : mobileNavLinkClass
                    }
                    onClick={() => setClick(false)}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Authenticated sub-links */}
            {isAuthenticated && user && (
              <div className='space-y-1 pt-1 pb-5 border-b border-outline-variant'>
                <NavLink to='/favorite' className={mobileNavLinkClass} onClick={() => setClick(false)}>
                  Mes Favoris
                </NavLink>
                {user.announcer && (
                  <NavLink
                    to={`/announcers/${user.announcer}`}
                    className={mobileNavLinkClass}
                    onClick={() => setClick(false)}
                  >
                    Mon Compte Annonceur
                  </NavLink>
                )}
                {user.is_admin && (
                  <NavLink to='/dashboard' className={mobileNavLinkClass} onClick={() => setClick(false)}>
                    Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => { navigate('/settings'); setClick(false); }}
                  className='w-full text-left py-3.5 px-4 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors'
                >
                  Paramètres
                </button>
              </div>
            )}

            {/* Auth action */}
            <div>
              {!isAuthenticated ? (
                <button
                  onClick={() => { signinDialogActions.toggle(); setClick(false); }}
                  className='w-full rounded-xl border border-primary bg-surface-container-lowest px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5'
                >
                  Se connecter
                </button>
              ) : (
                <button
                  onClick={() => { logout(); setClick(false); }}
                  className='w-full rounded-xl border border-error/30 bg-surface-container-lowest px-6 py-3.5 text-sm font-semibold text-error transition-colors hover:bg-error/5'
                >
                  Se déconnecter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPostDialog && <ArticlePostDialog toggleDialog={() => setShowPostDialog(false)} />}
      {showAnnouncerRequiredModal && (
        <AnnouncerRequiredModal onClose={() => setShowAnnouncerRequiredModal(false)} />
      )}
    </nav>
  );
}
