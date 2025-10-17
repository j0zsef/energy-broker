import './header.scss';
import { Dropdown } from 'react-bootstrap';

interface HeaderProps {
  isAuthenticated: boolean
  user?: { name?: string, email?: string }
  onLogin: () => void
  onLogout: () => void
}

export const Header = ({ isAuthenticated, user, onLogin, onLogout }: HeaderProps) => {
  if (!isAuthenticated) {
    return (
      <header className="header">
        <button onClick={onLogin}>Sign In</button>
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
          <Dropdown.Item href="/summary">Summary</Dropdown.Item>
          <Dropdown.Item href="/settings">Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={onLogout}>Sign Out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <hr className="divider" />
    </header>
  );
};
