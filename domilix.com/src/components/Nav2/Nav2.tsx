'use client';

import Logo from '@assets/domilix.png';
import { signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import ProfilePopup from '../ProfilePopup/ProfilePopup';
import NotificationPopup from '../NotificationPopup/NotificationPopup';
import AnnouncerRequiredModal from '@components/AnnouncerRequiredModal/AnnouncerRequiredModal';
import ArticlePostDialog from '@components/ArticlePostDialog/ArticlePostDialog';
import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import { notificationApi } from '../../services/notificationApi';
import React, { useState, useEffect, useRef } from 'react';
import { HiBars3, HiXMark, HiBell, HiHomeModern, HiSparkles, HiChevronDown } from 'react-icons/hi2';
import { MdChair, MdLandscape, MdOutlineCampaign } from 'react-icons/md';
import { NavLink, useNavigate } from '@router';

const defaultLinks = [
  { name: 'Acheter', url: '/subscriptions' },
  { name: 'Immobiliers', url: '/houses' },
  { name: 'Mobiliers', url: '/furnitures' },
  { name: 'Terrains', url: '/terrains' },
];

type Nav2Props = {
  links?: Array<{ name: string; url: string }>;
  highlightBuyLink?: boolean;
};

const linkIcons: Record<string, React.ReactNode> = {
  '/subscriptions': <HiSparkles className='h-4 w-4 shrink-0' />,
  '/houses': <HiHomeModern className='h-4 w-4 shrink-0' />,
  '/furnitures': <MdChair className='h-4 w-4 shrink-0' />,
  '/terrains': <MdLandscape className='h-4 w-4 shrink-0' />,
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonDesktopRef = useRef<HTMLButtonElement>(null);
  const profileButtonMobileRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const userCredits = Number(user?.credits || 0);

  const handlePublishClick = () => {
    if (!user?.announcer) {
      setShowAnnouncerRequiredModal(true);
      return;
    }
    setShowPostDialog(true);
  };

  const requestLogout = () => {
    setShowProfileMenu(false);
    setClick(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
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

  return (
    <nav className='bg-surface navbar top-0 left-0 fixed w-full px-3 sm:px-6 lg:px-10 z-50 shadow-sm border-b border-outline-variant'>
      <div className='flex h-16 items-center justify-between text-on-surface max-w-container mx-auto sm:h-20'>
        <div className='flex items-center flex-shrink-0'>
          <NavLink className='text-2xl font-bold flex' to='/' data-tour='nav-logo'>
            <img src={logoSrc} alt='logo' className='h-5 sm:h-7 lg:h-8' />
          </NavLink>
        </div>

        {/* Menu Desktop */}
        <div className='hidden lg:flex items-center gap-6 xl:gap-8'>
          <ul className='flex items-center gap-6 xl:gap-8' data-tour='nav-links'>
            {links.map(link => (
              <li key={link.name}>
                <NavLink
                  to={link.url}
                  className={({ isActive }) =>
                    highlightBuyLink && link.name === 'Acheter'
                      ? `inline-flex items-center gap-1.5 rounded-full border border-pink-500 bg-pink-500 px-3 py-1 font-bold text-white shadow-sm -translate-y-px text-sm xl:text-base whitespace-nowrap transition-all ${isActive
                        ? 'ring-2 ring-pink-200'
                        : 'hover:bg-pink-600 hover:border-pink-600 hover:shadow'
                      }`
                      : isActive
                        ? 'inline-flex items-center gap-1.5 text-primary border-b-2 border-primary pb-1 text-body-md font-semibold'
                        : 'inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-md font-semibold whitespace-nowrap'
                  }
                >
                  {linkIcons[link.url]}
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
                to='/settings?tab=packs'
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
                    onLogout={requestLogout}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Mobile right cluster ── */}
        <div className='flex lg:hidden items-center gap-1.5 sm:gap-2'>
          {isAuthenticated && (
            <>

              {/* Domicoins pill icon+count */}
              <NavLink
                to='/settings?tab=packs'
                data-tour='user-credits'
                className={({ isActive }) =>
                  `flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest py-1 pl-1.5 pr-1.5 transition-colors hover:bg-surface-container-low sm:gap-1.5 sm:pl-2 sm:pr-3 ${isActive ? 'border-primary/30 bg-primary/5' : ''}`
                }
              >
                <img src='/dom.png' alt='coin' className='h-4 w-4' />
                <span className=' text-xs font-bold text-primary'>{userCredits}</span>
              </NavLink>


              {/* Bell */}
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => { setShowNotifications(prev => !prev); setShowProfileMenu(false); }}
                  className='relative flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest transition-colors hover:bg-surface-container-low sm:h-9 sm:w-9'
                  aria-label='Notifications'
                >
                  <HiBell className='h-4 w-4 text-on-surface sm:h-5 sm:w-5' />
                  {unreadCount > 0 && (
                    <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[8px] font-bold text-white sm:h-[18px] sm:w-[18px] sm:text-[9px]'>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                )}
              </div>



              {/* Avatar pill + chevron */}
              <div className='relative'>
                <button
                  type='button'
                  ref={profileButtonMobileRef}
                  onClick={e => { e.stopPropagation(); setShowProfileMenu(prev => !prev); setShowNotifications(false); }}
                  className='flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest p-0.5 transition-colors hover:bg-surface-container-low sm:gap-1.5 sm:p-1'
                >
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary'>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  {/* <HiChevronDown className={`h-3 w-3 text-on-surface-variant transition-transform duration-200 sm:h-3.5 sm:w-3.5 ${showProfileMenu ? 'rotate-180' : ''}`} /> */}
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
                    onLogout={requestLogout}
                  />
                )}
              </div>
            </>
          )}

          {/* Hamburger / X */}
          <button
            type='button'
            className='flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest transition-colors hover:bg-surface-container-low sm:h-9 sm:w-9'
            onClick={() => setClick(c => !c)}
            aria-label={click ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {click ? (
              <HiXMark className='h-4 w-4 text-on-surface sm:h-5 sm:w-5' />
            ) : (
              <HiBars3 className='h-4 w-4 text-on-surface sm:h-5 sm:w-5' />
            )}
          </button>
        </div>
      </div>

      {click && (
        <button
          type='button'
          className='fixed inset-x-0 bottom-0 top-16 z-30 bg-white/45 backdrop-blur-md lg:hidden sm:top-20'
          aria-label='Fermer le menu mobile'
          onClick={() => setClick(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      {click && (
        <div className='absolute left-0 right-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white shadow-xl lg:hidden sm:top-20 sm:max-h-[calc(100vh-5rem)]'>
          <div className='mx-auto max-w-container px-5 py-5 sm:px-6 sm:py-7'>
            <ul className='space-y-5 text-[18px] font-bold text-primary sm:space-y-8 sm:text-[20px]'>
              <li>
                <button
                  type='button'
                  onClick={() => { handlePublishClick(); setClick(false); }}
                  className='flex items-center gap-3 text-left sm:gap-4'
                >
                  <MdOutlineCampaign className='h-5 w-5 shrink-0 -rotate-12' />
                  Je publie une annonce
                </button>
              </li>
              <li>
                <NavLink
                  to='/houses'
                  className='flex items-center gap-3 sm:gap-4'
                  onClick={() => setClick(false)}
                >
                  <HiHomeModern className='h-5 w-5 shrink-0' />
                  Je cherche un logement
                </NavLink>
              </li>
              <li>
                <NavLink
                  to='/furnitures'
                  className='flex items-center gap-3 sm:gap-4'
                  onClick={() => setClick(false)}
                >
                  <HiSparkles className='h-5 w-5 shrink-0' />
                  Je cherche du mobilier
                </NavLink>
              </li>
              <li>
                <NavLink
                  to='/terrains'
                  className='flex items-center gap-3 sm:gap-4'
                  onClick={() => setClick(false)}
                >
                  <svg className='h-5 w-5 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' />
                  </svg>
                  Je cherche un terrain
                </NavLink>
              </li>
              <li>
                <NavLink
                  to='/subscriptions'
                  className='flex items-center gap-3 sm:gap-4'
                  onClick={() => setClick(false)}
                >
                  <HiSparkles className='h-5 w-5 shrink-0' />
                  Acheter un pack Domilix
                </NavLink>
              </li>
            </ul>

            <div className='mt-6 border-t border-slate-100 pt-5 sm:mt-8'>
              {!isAuthenticated ? (
                <button
                  type='button'
                  onClick={() => { signinDialogActions.toggle(); setClick(false); }}
                  className='w-full rounded-xl border border-primary bg-surface-container-lowest px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5'
                >
                  Se connecter
                </button>
              ) : (
                <div className='flex items-center justify-between gap-4'>
                  <button
                    type='button'
                    onClick={() => { navigate('/settings'); setClick(false); }}
                    className='text-base font-bold text-primary'
                  >
                    Paramètres
                  </button>
                  <button
                    onClick={requestLogout}
                    className='text-base font-bold text-red-600'
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPostDialog && <ArticlePostDialog toggleDialog={() => setShowPostDialog(false)} />}
      {showAnnouncerRequiredModal && (
        <AnnouncerRequiredModal onClose={() => setShowAnnouncerRequiredModal(false)} />
      )}
      <ConfirmDialog
        open={showLogoutConfirm}
        title='Se déconnecter ?'
        description='Vous devrez vous reconnecter pour publier, gérer vos annonces ou consulter vos informations.'
        confirmLabel='Se déconnecter'
        tone='danger'
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </nav>
  );
}
