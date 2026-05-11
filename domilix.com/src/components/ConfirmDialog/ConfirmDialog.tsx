'use client';

import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = tone === 'danger';

  return (
    <div className='fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm'>
      <div className='relative w-full max-w-md overflow-hidden rounded-[1.7rem] bg-white shadow-2xl shadow-slate-950/20'>
        <button
          type='button'
          onClick={onCancel}
          className='absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
          aria-label='Fermer'
        >
          <HiXMark className='h-5 w-5' />
        </button>

        <div className='px-6 pb-6 pt-8'>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-primary'}`}>
            <HiExclamationTriangle className='h-7 w-7' />
          </div>

          <h2 className='text-2xl font-black tracking-tight text-slate-950'>{title}</h2>
          <p className='mt-3 text-sm leading-6 text-slate-500'>{description}</p>

          <div className='mt-7 grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={loading}
              className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60'
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition disabled:opacity-60 ${isDanger ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 'bg-primary shadow-orange-500/20 hover:bg-orange-600'}`}
            >
              {loading ? 'Patientez...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
