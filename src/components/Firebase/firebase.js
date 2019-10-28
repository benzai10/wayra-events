import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
  apiKey: "AIzaSyCeiHn8UskG8ROKyZnpZqGFTXcuaKyw6WQ",
  authDomain: "wayra-events.firebaseapp.com",
  databaseURL: "https://wayra-events.firebaseio.com",
  projectId: "wayra-events",
  storageBucket: "wayra-events.appspot.com",
  messagingSenderId: "371536441766",
  appId: "1:371536441766:web:06c6ef167ae5b789b7df67",
  measurementId: "G-7EN5QSM366"
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.firestore();

    /* Helper */
    this.fieldValue = app.firestore.FieldValue;
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);


  // *** User API ***
  user = uid => this.db.doc(`users/${uid}`);
  users = () => this.db.collection('users');

  // *** Events API ***
  event = uid => this.db.doc(`events/${uid}`);
  events = () => this.db.collection('events');
}

export default Firebase;

