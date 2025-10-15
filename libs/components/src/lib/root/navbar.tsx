import './navbar.scss';
import { Navbar as BootstrapNavBar, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Container } from '../shared/container';
import { Link } from '@tanstack/react-router';
import { NavbarBrand } from 'react-bootstrap';

export const Navbar = () => {
  return (
    <BootstrapNavBar expand={false}>
      <Container border={true}>
        <NavbarBrand as={Link} to="/">Energy Broker</NavbarBrand>
        <hr className="divider" />
        <ListGroup>
          <ListGroupItem as={Link} to="/" className="navbar-item">
            Overview
          </ListGroupItem>
          <ListGroupItem as={Link} to="/connections" className="navbar-item">
            Energy Connections
          </ListGroupItem>
          <ListGroupItem as={Link} to="/carbon-credits" className="navbar-item">
            Carbon Credits
          </ListGroupItem>
          <ListGroupItem as={Link} to="/energy-providers" className="navbar-item">
            Energy Providers
          </ListGroupItem>
        </ListGroup>
      </Container>
    </BootstrapNavBar>
  );
};

export default Navbar;
