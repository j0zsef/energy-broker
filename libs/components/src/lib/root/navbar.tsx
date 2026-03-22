import './navbar.scss';
import { Link } from '@tanstack/react-router';
import { Nav } from 'react-bootstrap';

interface NavbarProps {
  onNavigate?: () => void
}

const NAV_ITEMS: { exact: boolean, label: string, to: string }[] = [
  { exact: true, label: 'Overview', to: '/' },
  { exact: false, label: 'Energy Connections', to: '/connections' },
  { exact: false, label: 'Energy Providers', to: '/energy-providers' },
  { exact: false, label: 'Carbon Credits', to: '/carbon-credits' },
];

export const Navbar = ({ onNavigate }: NavbarProps) => {
  return (
    <nav className="sidebar-nav">
      <Link className="sidebar-nav__brand" onClick={onNavigate} to="/">
        Energy Broker
      </Link>
      <Nav className="flex-column w-100">
        {NAV_ITEMS.map(item => (
          <Nav.Item key={item.to}>
            <Link
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: 'sidebar-nav__link sidebar-nav__link--active' }}
              className="sidebar-nav__link"
              onClick={onNavigate}
              to={item.to}
            >
              {item.label}
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </nav>
  );
};

export default Navbar;
