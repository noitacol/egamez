import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
}

const CountdownTimer = ({ endDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const formatTime = (value: number) => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  // Süre doldu ise
  if (isExpired) {
    return (
      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
        Teklif sona erdi!
      </div>
    );
  }
  
  // Sadece bir gün kaldıysa
  if (timeLeft.days === 0) {
    return (
      <div className="flex items-center space-x-1">
        <div className="bg-epicorange text-white rounded-full px-3 py-1 text-xs font-bold animate-pulse-slow">
          <span className="mr-1">Son</span>
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </div>
      </div>
    );
  }
  
  // Bir günden fazla kaldıysa
  return (
    <div className="flex items-center space-x-1">
      <div className="bg-epicblue text-white rounded-full px-3 py-1 text-xs font-bold">
        <span className="mr-1">{timeLeft.days}</span>
        <span>gün</span>
        <span className="ml-1">{formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}</span>
      </div>
    </div>
  );
};

export default CountdownTimer; 