'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const projectId = pathname?.split('/')[2]; // Extract project ID from /projects/[id]/...

  const navItems = [
    { label: 'Overview', href: `/projects/${projectId}` },
    { label: 'Subproject', href: `/projects/${projectId}/sub-projects` },
    { label: 'Our Team', href: `/projects/${projectId}/team` },
    { label: 'Technical Articles', href: `/projects/${projectId}/articles` },
  ];

  return (
    <>
      {/* Secondary Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-20 sm:top-[88px] md:top-24 z-40">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between h-14">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-black"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faAngleUp : faAngleDown} />
            </button>

          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block text-sm text-gray-700 hover:text-black font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </>
  );
}
