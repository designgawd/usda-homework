'use client';

import Image from 'next/image';

export default function Navigation() {
  return (
    <header className="bg-gray-100 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full">
      <div className="flex items-center">
        <Image src="https://www.ecfr.gov/assets/header/standard_masthead-f3899f5c3a62e696f2decae42628ca322f03223d9a95d07a1bda356d5696c5c8.svg" alt="Logo" width={600} height={40} />
      </div>
      <div className="flex items-center space-x-4">
        <Image src="/globe.svg" alt="Globe Icon" width={24} height={24} />
      </div>
    </header>
  );
}