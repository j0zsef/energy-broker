import './header.scss';
import { Button } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';

export type HeaderProps = {
  isAuthenticated: boolean
  user?: { name?: string, email?: string }
  onLogin: () => void
  onLogout: () => void
};

export const Header = ({ isAuthenticated, user, onLogin, onLogout }: HeaderProps) => {
  if (!isAuthenticated) {
    return (
      <header className="header">
        <Button onClick={onLogin}>Sign In</Button>
        <hr className="divider" />
      </header>
    );
  }

  return (
    <header className="header">
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="account-dropdown">
          <span>{user?.name || user?.email || 'Account'}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/account/summary">Summary</Dropdown.Item>
          <Dropdown.Item href="/account/settings">Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={onLogout}>Sign Out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <hr className="divider" />
    </header>
  );
};
