import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';
import logo from "../../images/wayra-logo.png";
import AppBar from '@material-ui/core/AppBar';

const styles = {
  logo: {
    margin: 15,
    width: 100,
  }
};

const Navigation = () => (
  <AppBar>
    <img src={logo} alt="logo" style={styles.logo} />
    <AuthUserContext.Consumer>
      {authUser =>
       authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </AppBar>
);

const NavigationAuth = () => (
  <div></div>
);

const NavigationNonAuth = () => (
  <div></div>
);

export default Navigation;
