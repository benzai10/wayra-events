import React, { Fragment } from 'react';
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
	 authUser ? <NavigationAuth user={authUser} /> : <NavigationNonAuth />
	}
      </AuthUserContext.Consumer>
    </Toolbar>
  </AppBar>
);

const NavigationAuth = (props) => (
  <Fragment>
    <span style={{ marginLeft: 'auto' }}>{props.user.email}</span>
    <SignOutButton />
  </Fragment>
);

const NavigationNonAuth = () => (
  <div></div>
);

export default Navigation;
