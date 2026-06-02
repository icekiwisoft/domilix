'use client';

import Logo from '@assets/domilix.png';
import { signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import ProfilePopup from '@components/ProfilePopup/ProfilePopup';
import NotificationPopup from '@components/NotificationPopup/NotificationPopup';
import { notificationApi } from '@services/notificationApi';
import { useState, useEffect, useRef, useCallback } from 'react';
import { HiBars3, HiXMark, HiBell, HiArrowLeft } from 'react-icons/hi2';
import { NavLink, useNavigate, Link } from '@router';

export default function MapNav() {
  const logoSrc = typeof Logo === 'string' ? Logo : Logo.src;

  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const userCredits = Number(user?.credits || 0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const refreshUnreadCount = useCallback(() => {
    if (!isAuthenticated) return;
    notificationApi.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    const handler = () => refreshUnreadCount();
    window.addEventListener('notificationUpdate', handler);
    return () => window.removeEventListener('notificationUpdate', handler);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!showNotifications) return;
    refreshUnreadCount();
  }, [showNotifications, refreshUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node) &&
          profileButtonRef.current && !profileButtonRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Immobiliers', url: '/houses' },
    { name: 'Mobiliers', url: '/furnitures' },
    { name: 'Acheter', url: '/subscriptions' },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Domilix" className="h-7 w-auto md:h-8" />
            <span className="hidden text-sm font-black text-gray-900 md:inline" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className="text-[#E8921A]">Maps</span>
            </span>
          </Link>
          <div className="hidden h-5 w-px bg-gray-200 md:block" />
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.url}
              to={link.url}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/settings?tab=packs"
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pl-1.5 pr-1.5 transition hover:bg-gray-50 sm:gap-1.5 sm:pl-2 sm:pr-3"
              >
                <img src="/dom.png" alt="coin" className="h-4 w-4" />
                <span className="text-xs font-bold text-brand-600">{userCredits}</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <HiBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
              )}
              <button
                ref={profileButtonRef}
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                  {(user?.name || user?.email || '?')[0].toUpperCase()}
                </div>
                <span className="hidden max-w-[100px] truncate text-xs font-medium text-gray-700 md:block">
                  {user?.name || user?.email}
                </span>
              </button>
              {showProfileMenu && user && (
                <ProfilePopup
                  ref={profileMenuRef}
                  user={user}
                  onClose={() => setShowProfileMenu(false)}
                  favoritesHref='/favorite'
                  subscriptionsHref='/settings?tab=packs'
                  onOpenSettings={() => { navigate('/settings'); setShowProfileMenu(false); }}
                  onLogout={logout}
                />
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => signinDialogActions.toggle()}
                className="rounded-lg px-4 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => {
                  signinDialogActions.toggle();
                  setTimeout(() => {
                    const tab = document.querySelector('[data-signup-tab]') as HTMLElement;
                    tab?.click();
                  }, 100);
                }}
                className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600"
              >
                Créer un compte
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 md:hidden"
          >
            {menuOpen ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoSrc} alt="Domilix" className="h-6 w-auto" />
              <span className="text-xs font-black text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span className="text-[#E8921A]">Maps</span>
              </span>
            </Link>
          </div>
          <div className="mt-2 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.url}
                to={link.url}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

          </div>
        </div>
      )}
    </nav>
  );
}
