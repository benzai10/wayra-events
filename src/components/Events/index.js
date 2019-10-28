import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const styles = {
  buttonContainer: {
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
  },
};


class Events extends Component {
  constructor (props) {
    super(props);

    this.state = {
      events: [],
      loading: false,
      open: false,
      title: '',
      description: '',
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .events()
      .onSnapshot(snapshot => {
	if (snapshot.size) {
	  let events = [];
	  snapshot.forEach(doc =>
			   events.push({ ...doc.data(), uid: doc.id }),
			  );

	  this.setState({
            events: events,
	    loading: false,
	  });
	} else {
	  this.setState({ events: null, loading: false });
	}
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = () => {
    this.props.firebase.events().add({
      createdAt: this.props.firebase.fieldValue.serverTimestamp(),
      title: this.state.title,
      description: this.state.description
    });

    this.setState({
      title: '',
      description: '',
    });

    this.handleClose();
  }


  render() {
    const { loading, events, open } = this.state;

    return (
      <div>
	<div style={styles.buttonContainer}>
	  <Button onClick={this.handleOpen}>
	    Add Event
	  </Button>
	</div>
        <Dialog
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <DialogTitle>Add new Event</DialogTitle>
            <form>
	      <TextField
		name="title"
		type="text"
		label="Title"
		placeholder="Enter title"
		value={this.state.title}
		onChange={this.handleChange}
		fullWidth
	      />
	      <TextField
		name="description"
		type="text"
		label="Description"
		placeholder="Enter description"
		value={this.state.description}
		onChange={this.handleChange}
		fullWidth
	      />
	    </form>
	    <DialogActions>
	      <Button onClick={this.handleClose}>
		Cancel
	      </Button>
	      <Button onClick={this.handleSubmit}>
		Save
	      </Button>
	    </DialogActions>
	  </DialogContent>
	</Dialog>
	{loading &&
	 <div style={styles.loading}>
	   <CircularProgress color="secondary"/>
	 </div>
	}
	{events && 

	 <Grid
	   container
	   spacing={2}
	 >
	   {events.map(evt => (
             <Grid
               item
               key={evt.uid}
               sm={4}
             >
               <Card>
                 <CardContent>
		   <h3>{evt.title}</h3>
                   <p>{evt.description}</p>
		 </CardContent>
	       </Card>
             </Grid>
	   ))}
	 </Grid>
	}
      </div>
    );
  }
}

export default compose(
  withFirebase,
)(Events);
