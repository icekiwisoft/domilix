import React, { useEffect, useState } from 'react';
import { TimerProps } from 'utils/types';

const Timer: React.FC<TimerProps> = ({
  targetDate,
  displayMonths = false,
  dayDigits = 2,
}) => {
  const calculateTimeLeft = () => {
    const difference = targetDate.getTime() - new Date().getTime();
    let timeLeft = {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };

    if (difference > 0) {
      timeLeft = {
        days: (displayMonths
          ? Math.floor(difference / (1000 * 60 * 60 * 24 * 30))
          : Math.floor(difference / (1000 * 60 * 60 * 24))
        )
          .toString()
          .padStart(dayDigits, '0'),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
          .toString()
          .padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60)
          .toString()
          .padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60)
          .toString()
          .padStart(2, '0'),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const renderDigitBlocks = (value: string, digits: number) => {
    const chars = value.padStart(digits, '0').split('');

    return (
      <div className='flex items-center justify-center gap-1.5'>
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className='inline-flex h-11 w-8 items-center justify-center rounded-md border border-orange-100 bg-orange-50 text-lg font-semibold text-orange-600 sm:h-12 sm:w-9 sm:text-2xl'
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, displayMonths]);

  return (
    <div className='text-center mx-auto w-96 py-4 px-4'>
      <div className='flex items-center justify-center w-full lg:gap-8 sm:gap-5 gap-1 count-down-main'>
        <div className='timer'>
          {renderDigitBlocks(timeLeft.days, dayDigits)}
          <p className=' lg:text-sm text-xs font-normal text-gray-700 mt-1 text-center w-full'>
            {displayMonths ? 'mois' : 'jours'}
          </p>
        </div>
        <h3 className='font-manrope font-semibold text-xl text-gray-700'>:</h3>
        <div className='timer'>
          {renderDigitBlocks(timeLeft.hours, 2)}
          <p className=' lg:text-sm text-xs font-normal text-gray-700 mt-1 text-center w-full'>
            heures
          </p>
        </div>
        <h3 className='font-manrope font-semibold text-xl text-gray-700'>:</h3>
        <div className='timer'>
          {renderDigitBlocks(timeLeft.minutes, 2)}
          <p className=' lg:text-sm text-xs font-normal text-gray-700 mt-1 text-center w-full'>
            minutes
          </p>
        </div>
        <h3 className='font-manrope font-semibold text-xl text-gray-700'>:</h3>
        <div className='timer'>
          {renderDigitBlocks(timeLeft.seconds, 2)}
          <p className=' lg:text-sm text-xs font-normal text-gray-700 mt-1 text-center w-full'>
            secondes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timer;
