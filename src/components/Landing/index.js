import React from 'react';
import Events from '../Events';

const styles = {
  root: {
    marginTop: 80,
  },
  title: {
    textAlign: 'center',
  }
};

const Landing = () => (
  <div style={styles.root}>
    <h1 style={styles.title}>Wayra Events 2019</h1>
    <Events />
  </div>
);

export default Landing;
