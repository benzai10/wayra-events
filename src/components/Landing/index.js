import React from 'react';
import Events from '../Events';

const styles = {
  root: {
    marginTop: 80,
  },
  title: {
    fontSize: '1.3em',
    textAlign: 'center',
  }
};

const Landing = () => (
  <div>
    <h1 style={styles.title}>Wayra Events</h1>
    <Events />
  </div>
);

export default Landing;
