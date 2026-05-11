'use client';

import { useEffect, useState } from 'react';

const TOUR_STORAGE_KEY = 'domilix-site-tour-v2';
const SPOTLIGHT_PADDING = 10;

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

const tourSteps: TourStep[] = [
  {
    selector: '[data-tour="nav-logo"]',
    title: 'Bienvenue sur Domilix',
    description: 'Revenez a l\'accueil a tout moment depuis le logo.',
  },
  {
    selector: '[data-tour="nav-links"]',
    title: 'Naviguez rapidement',
    description: 'Accedez aux packs, annonces immobilieres et mobiliers depuis le menu principal.',
  },
  {
    selector: '[data-tour="publish-ad"]',
    title: 'Publiez une annonce',
    description: 'Proposez un bien ou un espace depuis ce bouton lorsque votre compte annonceur est pret.',
  },
  {
    selector: '[data-tour="user-credits"]',
    title: 'Vos Domicoins',
    description: 'Consultez vos Domicoins et choisissez un pack pour debloquer des contacts.',
  },
  {
    selector: '[data-tour="houses-filters"]',
    title: 'Recherchez plus vite',
    description: 'Filtrez les annonces par localisation, budget, type de bien et equipements.',
  },
  {
    selector: '[data-tour="promo-swiper"]',
    title: 'Promotions annonceurs',
    description: 'Retrouvez ici les annonces et offres mises en avant.',
  },
  {
    selector: '[data-tour="ads-grid"]',
    title: 'Parcourez les annonces',
    description: 'Les biens disponibles sont regroupes par ville pour faciliter votre recherche.',
  },
  {
    selector: '[data-tour="packs-grid"]',
    title: 'Choisissez un pack',
    description: 'Les packs vous donnent des Domicoins pour debloquer les contacts des annonces.',
  },
];

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getTargetElement(selector: string) {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

  return elements.find(element => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    return rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden';
  });
}

function getVisibleSteps() {
  return tourSteps.filter(step => getTargetElement(step.selector));
}

export default function SiteTour() {
  const [canStartTour, setCanStartTour] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<TourStep[]>([]);

  const currentStep = visibleSteps[stepIndex];

  const closeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'seen');
    setIsTourOpen(false);
    setStepIndex(0);
  };

  const startTour = () => {
    const nextVisibleSteps = getVisibleSteps();
    setVisibleSteps(nextVisibleSteps);
    setStepIndex(0);
    setIsTourOpen(nextVisibleSteps.length > 0);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCanStartTour(true);

      if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
        startTour();
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isTourOpen || !currentStep) return undefined;

    const updateSpotlight = () => {
      const element = getTargetElement(currentStep.selector);
      if (!element) return;

      element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });

      window.setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          top: Math.max(rect.top - SPOTLIGHT_PADDING, 8),
          left: Math.max(rect.left - SPOTLIGHT_PADDING, 8),
          width: rect.width + SPOTLIGHT_PADDING * 2,
          height: rect.height + SPOTLIGHT_PADDING * 2,
        });
      }, 250);
    };

    const updateTimer = window.setTimeout(() => {
      updateSpotlight();
    }, 80);

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      window.clearTimeout(updateTimer);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [currentStep, isTourOpen]);

  useEffect(() => {
    if (!isTourOpen && canStartTour) {
      setSpotlightRect(null);
    }
  }, [canStartTour, isTourOpen]);

  if (!canStartTour) return null;

  const totalSteps = visibleSteps.length;
  const hasWindow = typeof window !== 'undefined';
  const popoverTop = spotlightRect && hasWindow
    ? Math.min(spotlightRect.top + spotlightRect.height + 14, window.innerHeight - 210)
    : 96;
  const popoverLeft = spotlightRect && hasWindow
    ? Math.min(Math.max(spotlightRect.left, 16), window.innerWidth - 336)
    : 16;

  return (
    <>
      <button
        type='button'
        onClick={startTour}
        className='fixed bottom-5 left-5 z-[80] rounded-full bg-[#0d3556] px-4 py-2 text-xs font-black text-white shadow-xl shadow-slate-950/20 transition hover:bg-orange-500 sm:text-sm'
      >
        Tutoriel
      </button>

      {isTourOpen && currentStep && spotlightRect && (
        <div className='fixed inset-0 z-[100] pointer-events-none'>
          <div className='absolute left-0 right-0 top-0 bg-slate-950/70' style={{ height: spotlightRect.top }} />
          <div
            className='absolute left-0 bg-slate-950/70'
            style={{ top: spotlightRect.top, width: spotlightRect.left, height: spotlightRect.height }}
          />
          <div
            className='absolute bg-slate-950/70'
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left + spotlightRect.width,
              right: 0,
              height: spotlightRect.height,
            }}
          />
          <div
            className='absolute left-0 right-0 bottom-0 bg-slate-950/70'
            style={{ top: spotlightRect.top + spotlightRect.height }}
          />

          <div
            className='absolute rounded-2xl border-2 border-orange-400 shadow-[0_0_0_9999px_rgba(15,23,42,0)] ring-4 ring-orange-300/30'
            style={spotlightRect}
          />

          <div
            className='pointer-events-auto absolute w-[min(20rem,calc(100vw-2rem))] rounded-3xl bg-white p-5 text-left shadow-2xl'
            style={{ top: popoverTop, left: popoverLeft }}
          >
            <p className='mb-2 text-xs font-black uppercase tracking-[0.2em] text-orange-500'>
              Etape {stepIndex + 1}/{totalSteps}
            </p>
            <h3 className='mb-2 text-xl font-black text-gray-950'>{currentStep.title}</h3>
            <p className='mb-5 text-sm leading-6 text-gray-600'>{currentStep.description}</p>

            <div className='flex items-center justify-between gap-2'>
              <button
                type='button'
                onClick={closeTour}
                className='rounded-full px-3 py-2 text-xs font-black text-gray-500 transition hover:bg-gray-100 hover:text-gray-900'
              >
                Quitter
              </button>

              <div className='flex gap-2'>
                {stepIndex > 0 && (
                  <button
                    type='button'
                    onClick={() => setStepIndex(index => index - 1)}
                    className='rounded-full bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-200'
                  >
                    Retour
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => {
                    if (stepIndex >= totalSteps - 1) closeTour();
                    else setStepIndex(index => index + 1);
                  }}
                  className='rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-600'
                >
                  {stepIndex >= totalSteps - 1 ? 'Terminer' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
