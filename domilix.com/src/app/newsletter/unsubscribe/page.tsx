'use client';

import { newsletterApi } from '@services/newsletterApi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type Status = 'loading' | 'success' | 'error' | 'missing';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!clientId) {
      setStatus('missing');
      setMessage("Lien de désabonnement invalide. Aucun identifiant trouvé.");
      return;
    }

    let cancelled = false;

    newsletterApi.unsubscribe(clientId).then((res) => {
      if (!cancelled) {
        setStatus('success');
        setMessage(res.message || 'Vous avez été désabonné avec succès.');
      }
    }).catch((err) => {
      if (!cancelled) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f4f4f5',
      fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif",
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '48px 32px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <rect width="64" height="64" rx="16" fill="#E8921A" />
            <path d="M20 28L32 18L44 28V44C44 45.1 43.1 46 42 46H22C20.9 46 20 45.1 20 44V28Z" fill="white" />
            <path d="M26 46V34H38V46" stroke="#E8921A" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {status === 'loading' && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
              Désabonnement en cours...
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              Veuillez patienter un instant.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
              Désabonnement réussi
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px' }}>
              {message}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '10px',
                backgroundColor: '#E8921A',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              Retour à l'accueil
            </Link>
          </>
        )}

        {(status === 'error' || status === 'missing') && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
              Oups !
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px' }}>
              {message}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '10px',
                backgroundColor: '#E8921A',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f4f4f5',
        fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif",
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          padding: '48px 32px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
            Désabonnement en cours...
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
            Veuillez patienter un instant.
          </p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}