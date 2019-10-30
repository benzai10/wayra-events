import React from 'react';
import SignOutButton from '../SignOut';
import { AuthUserContext } from '../Session';
import logo from "../../images/wayra-logo.png";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const styles = {
  logo: {
    margin: 15,
    width: 100,
  }
};

const Navigation = () => (
  <AppBar position="static">
    <Toolbar>
      <a href="https://de.wayra.co/">
	<img src={logo} alt="logo" style={styles.logo} />
      </a>
      <AuthUserContext.Consumer>
	{authUser =>
	 authUser ? <NavigationAuth /> : <NavigationNonAuth />
	}
      </AuthUserContext.Consumer>
    </Toolbar>
  </AppBar>
);

const NavigationAuth = () => (
  <div>
    <SignOutButton style={{ float: 'right' }} />
  </div>
);

const NavigationNonAuth = () => (
  <div></div>
);

export default Navigation;
