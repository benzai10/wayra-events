import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
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

const SignUpPage = () => (
  <Grid
    container
    spacing={0}
    direction="row"
    justify="center"
    alignItems="center"
  >
    <Grid item xs={12} style={{ maxWidth: isMobileDevice() ? '100%' : 400 }}>
      <h1 style={styles.title}>Sign up</h1>
      <SignUpForm />
    </Grid>
  </Grid>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};


class SignUpFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, passwordOne } = this.state;
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
          });
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';


    return (
      <form onSubmit={this.onSubmit} style={styles.form}>
        <TextField
          name="username"
          label="Username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
          style={styles.formField}
        />
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
          name="passwordOne"
          label="Password"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
          style={styles.formField}
        />
        <TextField
          name="passwordTwo"
          label="Confirm Password"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
          style={styles.formField}
        />
        {error && <p>{error.message}</p>}
        <Button disabled={isInvalid} type="submit" style={styles.button}>
          Sign Up
        </Button>
      </form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

export default SignUpPage;
export { SignUpForm, SignUpLink };
