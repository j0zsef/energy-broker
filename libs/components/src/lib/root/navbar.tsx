import './navbar.scss';
import { Navbar as BootstrapNavBar, ListGroup, ListGroupItem } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { Link } from '@tanstack/react-router';
import { NavbarBrand } from 'react-bootstrap';

export function Navbar() {
  return (
    <BootstrapNavBar expand={false}>
      <Container>
        <NavbarBrand as={Link} to="/">Energy Broker</NavbarBrand>
        <hr className="divider" />
        <ListGroup>
          <ListGroupItem as={Link} to="/" className="navbar-item">
            Overview
          </ListGroupItem>
          <ListGroupItem as={Link} to="/energy-sources" className="navbar-item">
            Energy Sources
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
}

export default Navbar;
