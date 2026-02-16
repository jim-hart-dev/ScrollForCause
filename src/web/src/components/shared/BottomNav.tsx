import { NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const navItems = [
  { to: '/', label: 'Feed' },
  { to: '/explore', label: 'Explore' },
  { to: '/saved', label: 'Saved' },
  { to: '/profile', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs font-body ${
                  isActive ? 'text-coral' : 'text-navy/60'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <NavLink
              to="/login"
              className="flex flex-col items-center text-xs font-body text-navy/60"
            >
              <span>Sign In</span>
            </NavLink>
          </SignedOut>
        </li>
      </ul>
    </nav>
  );
}
