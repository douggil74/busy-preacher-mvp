'use client';
import { useEffect } from 'react';

export default function Debug() {
  useEffect(() => {
    const data = localStorage.getItem('busyChristian_prayers');
    console.log('PRAYER DATA:', data);
  }, []);
  
  return <div className="text-white p-8">Check console</div>;
}
