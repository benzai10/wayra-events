import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import { AuthUserContext } from '../Session';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';

const styles = {
  buttons: {
  },
  buttonContainer: {
    textAlign: 'center',
  },
  image: {
    paddingRight: 20,
    width: 150,
  },
  loading: {
    textAlign: 'center',
  },
};

function isMobileDevice() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
}


class Events extends Component {
  static contextType = AuthUserContext;

  constructor (props) {
    super(props);

    this.state = {
      currentEvent: {},
      dialogAction: 'add',
      events: [],
      loading: false,
      open: false,
      openEdit: false,
      openProgress: false,
      title: '',
      description: '',
      imageUrl: '',
      value: 0,
    };

    this.setRef = ref => {
      this.file = ref;
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .events()
      .orderBy('createdAt', 'desc')
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

  handleEdit = (event) => () => {
    this.setState({
      currentEvent: event,
      dialogAction: 'edit',
      title: event.title,
      description: event.description,
    });
    this.handleOpen();
  }

  handleClose = () => {
    this.setState({
      open: false,
      dialogAction: 'add',
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = () => {
    this.setState({ openProgress: true });

    if (this.file.files[0]) {
      var mainImage = this.props.firebase.storageRef().child(this.file.files[0].name);
      mainImage.put(this.file.files[0])
	.then(snapshot => {
	  mainImage.getDownloadURL()
	    .then(url => {
	      this.setState({ imageUrl: url, openProgress: false });
	      this.writeEvent();
	    });
	});
    } else {
      this.writeEvent();
    }
    this.handleClose();
  }

  writeEvent = () => {
    if (this.state.dialogAction === 'add') {
      this.props.firebase.events().add({
	createdAt: this.props.firebase.fieldValue.serverTimestamp(),
	title: this.state.title,
	description: this.state.description,
	imageUrl: this.state.imageUrl,
      });
    } else {
      this.props.firebase.event(this.state.currentEvent.uid).update({
	title: this.state.title,
	description: this.state.description,
      });
    }

    this.setState({
      openProgress: false,
      title: '',
      description: '',
    });
  }

  handleDelete = (event) => () => {
    this.props.firebase.event(event.uid).delete();
  }

  handleTabChange = (event, newValue) => {
    this.setState({
      value: newValue
    });
  }


  render() {
    const { loading, events, open, openProgress, value } = this.state;

    return (
      <div>
	{this.context
         ?
	  <div style={styles.buttonContainer}>
	    <Button onClick={this.handleOpen}>
	      Add Event
	    </Button>
	  </div>
	 :
	 <div></div>
	}
        <Dialog
          open={openProgress}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
	    <div style={styles.loading}>
	      <CircularProgress color="secondary"/>
	    </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <DialogTitle>
	      {this.state.dialogAction === 'add'
	       ?
	       "Add new Event"
	       :
	       "Edit Event"
	      }
            </DialogTitle>
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
              <input type="file" ref={this.setRef} />
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
	   spacing={0}
           direction="row"
           justify="center"
           alignItems="center"
	 >
	   <Grid item xs={12} style={{ maxWidth: isMobileDevice() ? '100%' : 900 }}>
	       <div>
		 <Tabs
		   value={value}
		   onChange={this.handleTabChange}
		   aria-label="simple tabs example"
		   variant="fullWidth"
		 >
		   <Tab style={styles.tab} label="UPCOMING" />
		   <Tab style={styles.tab} label="PASSED" />
		 </Tabs>
		 <div value={value} index={0} hidden={value !== 0}>
		   <List>
		     {events.map(evt => (
		       <div>
			 <ListItem alignItems="flex-start">
			   <ListItemAvatar>
			     <img src={evt.imageUrl} alt="" style={styles.image} />
			   </ListItemAvatar>
			   <ListItemText
			     primary={evt.title}
			     secondary={evt.description}
			   />
			 </ListItem>
			 {this.context
			  ?
			  <div style={styles.buttons}>
			    <Button onClick={this.handleEdit(evt)}>
	                      Edit
	                    </Button>
			    <Button onClick={this.handleDelete(evt)}>
	                      Delete
	                    </Button>
	                  </div>
	                  :
	                  <div></div>
	                 }
			 <Divider variant="inset" component="li" />
                       </div>
		     ))}
                   </List>
		 </div>
		 <div value={value} index={1} hidden={value !== 1}>
                   Passed events come here
		 </div>
	       </div>
           </Grid>
	 </Grid>
	}
      </div>
    );
  }
}

export default compose(
  withFirebase,
)(Events);
