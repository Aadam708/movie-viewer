import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Navbar = () => {

  // check if the current path on browser is equal to any of the paths on the links
  const pathname = usePathname();

  const linkStyle = (path:string) => {
    return pathname === path
      ? 'relative text-red-400 after:absolute after:left-0 after:right-0 after:bottom-[-2px] after:h-[1.8px] after:bg-red-400 after:content-[""]'
      : 'text-white hover:text-red-400 transition-colors duration-300';
  };

  return (
    <div className="flex flex-row justify-end gap-5">
      <Link href="/comedy" className={`-mt-14 h-5 ${linkStyle('/comedy')}`}>
        Comedy
      </Link>
      <Link href="/horror" className={`-mt-14 h-5 ${linkStyle('/horror')}`}>
        Horror
      </Link>
      <Link href="/animation" className={`-mt-14 h-5 ${linkStyle('/animation')}`}>
        Animation
      </Link>
    </div>
  );
};

export default Navbar;
