import React from 'react';
import { withFirebase } from '../Firebase';
import Button from '@material-ui/core/Button';

const SignOutButton = ({ firebase }) => (
    <Button onClick={firebase.doSignOut} style={{ marginLeft: 'auto' }}>
      Sign Out
    </Button>
);

export default withFirebase(SignOutButton);
