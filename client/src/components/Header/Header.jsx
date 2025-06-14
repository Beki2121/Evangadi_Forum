
import 'bootstrap/dist/css/bootstrap.min.css';
import React,  { useContext } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserState } from '../../App.jsx';
import EvangadiLogo from '../../Assets/Images/evangadi-logo-header.png';
import classes from './header.module.css';

function Header() {
  const { user } = useContext(UserState);
  const userId = user?.userid;

  const handleSignOut = () => {
    localStorage.removeItem('EV-Forum-token-G3-APR2024'); //remove the auth token
    window.location.replace('/auth'); //redirect to auth page so that user can login again
  };

  return (
    <>
      <Navbar
        bg='light '
        variant='light'
        expand='md'
        className='px-3'
        style={{
          position: 'sticky',
          top: '0',
          zIndex: '3',
          backgroundColor: 'white',
          borderBottom: '1px solid #dee2e6'
        }}
      >
        <Container className={classes.header_container}>
          <Navbar.Brand href='/'>
            <img
              src={EvangadiLogo}
              className='d-inline-block align-top'
              alt='Evangadi Logo'
              width='200'
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav  d-md-none'>
            <span className='navbar-toggler-icon'></span>
          </Navbar.Toggle>
          <Navbar.Collapse
            id='basic-navbar-nav'
            className=' w-50 flex-md-row'
            style={{ alignSelf: 'flex-end' }}
          >
            <Nav className='flex-column flex-md-row w-100 justify-content-end nav-links-holder'>
              {userId ? (
                <Nav.Link as={Link} to='/' className={classes.navigation_links}>
                  Home
                </Nav.Link>
              ) : null}

              <Nav.Link
                as={Link}
                to='/howitworks'
                className={classes.navigation_links}
              >
                How it Works
              </Nav.Link>
              {userId ? (
                <Button onClick={handleSignOut} className={classes.logout_btn}>
                  Logout
                </Button>
              ) : (
                <Nav.Link
                  as={Link}
                  to='/auth'
                  className={`${classes.navigation_links} ${classes.login_btn}`}
                >
                  Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;


