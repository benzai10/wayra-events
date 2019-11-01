import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import isMobileDevice from '../../helpers';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from "@material-ui/core/TextField";

const styles = {
  button: {
    float: 'right',
  },
  form: {
    textAlign: "left",
    paddingBottom: 30,
    fontSize: 13,
  },
  formField: {
    marginBottom: 20,
    fontSize: 14,
    width: '100%',
  },
  title: {
    textAlign: 'center',
  }
};

const SignInPage = () => (
  <Grid
    container
    spacing={0}
    direction="row"
    justify="center"
    alignItems="center"
  >
    <Grid item xs={12} style={{ maxWidth: isMobileDevice() ? '100%' : 400 }}>
      <h1 style={styles.title}>Sign in</h1>
      <SignInForm />
      <PasswordForgetLink />
      <SignUpLink />
    </Grid>
  </Grid>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};


class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.LANDING);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';

    return (
      <form onSubmit={this.onSubmit} style={styles.form}>
        <TextField
          name="email"
          label="Email Address"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
          style={styles.formField}
        />
        <TextField
          name="password"
          label="Password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
          style={styles.formField}
        />
        {error && <p>{error.message}</p>}
        <Button disabled={isInvalid} type="submit" style={styles.button}>
          Sign In
        </Button>
      </form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

export default SignInPage;
export { SignInForm };
