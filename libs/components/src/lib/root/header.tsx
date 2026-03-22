import './header.scss';
import { Button, Dropdown } from 'react-bootstrap';

export type HeaderProps = {
  isAuthenticated: boolean
  onLogin: () => void
  onLogout: () => void
  onToggleNav?: () => void
  user?: { email?: string, name?: string }
};

export const Header = ({ isAuthenticated, onLogin, onLogout, onToggleNav, user }: HeaderProps) => {
  return (
    <header className="app-header">
      <Button
        aria-label="Toggle navigation"
        className="d-md-none app-header__hamburger"
        onClick={onToggleNav}
        variant="outline-secondary"
      >
        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
          <line x1="3" x2="21" y1="12" y2="12" />
          <line x1="3" x2="21" y1="6" y2="6" />
          <line x1="3" x2="21" y1="18" y2="18" />
        </svg>
      </Button>

      <div className="ms-auto">
        {!isAuthenticated
          ? (
              <Button onClick={onLogin} variant="primary">Sign In</Button>
            )
          : (
              <Dropdown>
                <Dropdown.Toggle className="app-header__account" id="account-dropdown" variant="outline-secondary">
                  {user?.name || user?.email || 'Account'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/account/summary">Summary</Dropdown.Item>
                  <Dropdown.Item href="/account/settings">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>Sign Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
      </div>
    </header>
  );
};
