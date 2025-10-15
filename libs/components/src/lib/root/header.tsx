import './header.scss';
import { Dropdown } from 'react-bootstrap';

export const Header = () => {
  return (
    <header className="header">
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="account-dropdown">
          <span>Account</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/summary">Summary</Dropdown.Item>
          <Dropdown.Item href="/settings">Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="/sign-out">Sign Out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <hr className="divider" />
    </header>
  );
};
