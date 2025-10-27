'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Image src="/file.svg" alt="Logo" width={40} height={40} />
        <h1 className="text-xl ml-2 font-semibold">Agency Explorer</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Image src="/globe.svg" alt="Globe Icon" width={24} height={24} />
        <Image src="/window.svg" alt="Window Icon" width={24} height={24} />
      </div>
    </header>
  );
}