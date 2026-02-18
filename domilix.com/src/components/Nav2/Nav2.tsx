import Logo from '@assets/domilix.png';
import { signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import ProfileDialog from '../ProfileDialog/ProfileDialog';
import NotificationPopup from '../NotificationPopup/NotificationPopup';
import { notificationApi } from '../../services/notificationApi';
import React, { useState, useEffect, useRef } from 'react';
import { GoX } from 'react-icons/go';
import { HiBars3 } from 'react-icons/hi2';
import { HiOutlineBell } from 'react-icons/hi';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { name: 'Acheter', url: '/subscriptions' },
  { name: 'Immobiliers', url: '/houses' },
  { name: 'Mobiliers', url: '/furnitures' },
];

export default function Nav2(): React.ReactElement {
  const [click, setClick] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  console.log('user  is', user);
  const handleClick = () => setClick(!click);

  const userCredits = 0; // TODO: Add credits to User interface when available

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function ProfilePopup() {
    return (
      <div
        ref={profileMenuRef}
        className='absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border rounded-xl shadow-xl p-4 z-[60] animate-in slide-in-from-top-2 duration-200'
        onMouseDown={e => e.stopPropagation()}
      >
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center space-x-3 flex-1 min-w-0'>
            <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
              <span className='text-sm font-semibold'>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900 truncate'>
                {user?.name || 'Utilisateur'}
              </p>
              <p className='text-xs text-gray-600 truncate'>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowProfileMenu(false)}
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'
            aria-label='Fermer le menu'
          >
            <GoX className='text-lg' />
          </button>
        </div>

        <div className='space-y-1 border-t pt-3'>
          {user?.is_admin && (
            <button
              onClick={() => {
                navigate('/dashboard');
                setShowProfileMenu(false);
              }}
              className='w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm'
            >
              Dashboard
            </button>
          )}

          {user?.announcer && (
            <button
              onClick={() => {
                navigate(`/announcers/${user.announcer}`);
                setShowProfileMenu(false);
              }}
              className='w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm'
            >
              Mon Compte Annonceur
            </button>
          )}

          <button
            onClick={() => {
              navigate('/favorite');
              setShowProfileMenu(false);
            }}
            className='w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm'
          >
            Mes Favoris
          </button>

          <button
            onClick={() => {
              navigate('/subscriptions');
              setShowProfileMenu(false);
            }}
            className='w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm'
          >
            Mes Abonnements
          </button>

          <button
            onClick={() => {
              setShowProfileDialog(true);
              setShowProfileMenu(false);
            }}
            className='w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm'
          >
            Paramètres
          </button>

          <div className='border-t pt-2 mt-2'>
            <button
              onClick={() => {
                logout();
                setShowProfileMenu(false);
              }}
              className='w-full text-left py-3 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium'
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className='lg:hidden text-black bg-white min-h-screen absolute z-40 top-16 w-full left-0 right-0 transition-all duration-300 ease-in-out shadow-lg'>
      <div className='px-4 sm:px-6 py-6 max-w-7xl mx-auto'>
        {/* Section utilisateur connecté */}
        {isAuthenticated && user && (
          <div className='mb-6 pb-6 border-b border-gray-200'>
            <div className='flex items-center gap-3 sm:gap-4 mb-4'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center'>
                <span className='text-lg sm:text-xl font-semibold'>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-semibold text-gray-900 text-base sm:text-lg truncate'>
                  {user.name || 'Utilisateur'}
                </p>
                <p className='text-sm sm:text-base text-gray-600 truncate'>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Crédits */}
            <div className='flex items-center justify-center gap-2 bg-orange-50 rounded-xl p-4'>
              <img
                src='/dom.png'
                alt='coin'
                className='w-6 h-6 sm:w-7 sm:h-7'
              />
              <span className='font-bold text-orange-700 text-base sm:text-lg'>
                {userCredits} Domicoins
              </span>
            </div>
          </div>
        )}

        {/* Navigation principale */}
        <ul className='space-y-1 mb-6'>
          {links.map(link => (
            <li key={link.name}>
              <NavLink
                to={link.url}
                className={({ isActive }) =>
                  `block py-4 px-4 rounded-xl transition-colors text-base sm:text-lg ${
                    isActive
                      ? 'bg-gray-100 text-black font-bold border-l-4 border-black'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`
                }
                onClick={() => setClick(false)}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Menu utilisateur connecté */}
        {isAuthenticated && user && (
          <div className='space-y-1 mb-6 pb-6 border-b border-gray-200'>
            <NavLink
              to='/favorite'
              className={({ isActive }) =>
                `block py-4 px-4 rounded-xl transition-colors text-base sm:text-lg ${
                  isActive
                    ? 'bg-gray-100 text-black font-bold border-l-4 border-black'
                    : 'hover:bg-gray-50 text-gray-700'
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
                  `block py-4 px-4 rounded-xl transition-colors text-base sm:text-lg ${
                    isActive
                      ? 'bg-gray-100 text-black font-bold border-l-4 border-black'
                      : 'hover:bg-gray-50 text-gray-700'
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
                  `block py-4 px-4 rounded-xl transition-colors text-base sm:text-lg ${
                    isActive
                      ? 'bg-gray-100 text-black font-bold border-l-4 border-black'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`
                }
                onClick={() => setClick(false)}
              >
                Dashboard
              </NavLink>
            )}

            <button
              onClick={() => {
                setShowProfileDialog(true);
                setClick(false);
              }}
              className='w-full text-left py-4 px-4 hover:bg-gray-50 rounded-xl transition-colors text-base sm:text-lg text-gray-700'
            >
              Paramètres
            </button>
          </div>
        )}

        {/* Bouton de connexion/déconnexion */}
        <div className='pt-4'>
          {!isAuthenticated ? (
            <button
              onClick={() => {
                signinDialogActions.toggle();
                setClick(false);
              }}
              className='w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-indigo-600 sm:text-lg'
            >
              Se connecter
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                setClick(false);
              }}
              className='w-full text-red-500 hover:bg-red-50 font-semibold py-4 px-6 rounded-xl transition-colors border border-red-200 text-base sm:text-lg'
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
        <div className='flex items-center flex-shrink-0'>
          <NavLink className='text-2xl font-bold flex' to='/'>
            <img src={Logo} alt='logo' className='h-6 sm:h-7' />
          </NavLink>
        </div>

        {/* Menu Desktop */}
        <div className='hidden lg:flex items-center space-x-6'>
          <ul className='flex items-center space-x-6 xl:space-x-8'>
            {links.map(link => (
              <li key={link.name}>
                <NavLink
                  to={link.url}
                  className={({ isActive }) =>
                    isActive
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
              className='whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-indigo-600 xl:px-6 xl:text-base'
            >
              Se connecter
            </button>
          ) : (
            <div className='flex items-center space-x-3 xl:space-x-4'>
              <NavLink
                to='/subscriptions'
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                    isActive ? 'bg-yellow-50' : 'hover:bg-gray-100'
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
                  onClick={() => {
                    setShowProfileMenu(prev => !prev);
                    setShowNotifications(false);
                  }}
                  className='w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm xl:text-base font-semibold'
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {showProfileMenu && <ProfilePopup />}
              </div>
            </div>
          )}
        </div>
        {/* Mobile Menu */}
        <div className='flex lg:hidden items-center space-x-2 sm:space-x-3'>
          {isAuthenticated && (
            <>
              <NavLink
                to='/subscriptions'
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                    isActive ? 'bg-yellow-50' : 'hover:bg-gray-100'
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
                  onClick={() => {
                    setShowProfileMenu(prev => !prev);
                    setShowNotifications(false);
                  }}
                  className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm sm:text-base font-semibold'
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {showProfileMenu && <ProfilePopup />}
              </div>
            </>
          )}

          <button
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            onClick={handleClick}
            aria-label={click ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {click ? (
              <GoX className='text-2xl sm:text-3xl' />
            ) : (
              <HiBars3 className='text-2xl sm:text-3xl' />
            )}
          </button>
        </div>
      </div>
      {click && content}

      <ProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
      />
    </nav>
  );
}
