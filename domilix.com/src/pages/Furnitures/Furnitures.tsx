import Nav2 from '@components/Nav2/Nav2';
import Timer from '@components/Timer/Timer';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Furnitures(): React.ReactElement {
  const targetDate = new Date('2026-02-01T23:59:59');
  return (
    <>
      <Nav2 />
      <section className='bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center px-4'>
        <div className='max-w-4xl mx-auto text-center space-y-8 bg-white/80 backdrop-blur-sm p-12 rounded-2xl '>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight'>
            Bientôt disponible !
          </h1>

          <p className='text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed'>
            Nous travaillons d'arrache-pied pour vous proposer un nouveau
            service super cool. Reste connecté(e) pour en savoir plus.
          </p>

          <div className='mt-12'>
            <Timer targetDate={targetDate} />
          </div>
        </div>
      </section>
    </>
  );
}
