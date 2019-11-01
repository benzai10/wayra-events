import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';
import isMobileDevice from '../../helpers';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
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
  card: {
    margin: 15,
  },
  cardMedia: {
    height: 200,
  },
  eventDescriptionCard: {
    fontSize: '1.2em',
  },
  image: {
    paddingRight: 20,
    width: 150,
  },
  imageMobile: {
    paddingRight: 10,
    width: 80,
  },
  loading: {
    textAlign: 'center',
  },
};


class Events extends Component {
  static contextType = AuthUserContext;

  constructor (props) {
    super(props);

    this.state = {
      currentEvent: {},
      dialogAction: 'add',
      eventFromDate: '',
      eventUntilDate: '',
      eventFromTime: '',
      eventUntilTime: '',
      events: [],
      eventsPassed: [],
      eventsUpcoming: [],
      loading: false,
      location: '',
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
      .orderBy('eventFromDate', 'asc')
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
          this.compileEvents(events);
	} else {
	  this.setState({ events: null, loading: false });
	}
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  compileEvents = events => {
    this.setState({
      eventsUpcoming: events.filter(evt => evt.eventFromDate.seconds > (Date.now() / 1000)),
      eventsPassed: events.filter(evt => evt.eventFromDate.seconds < (Date.now() / 1000)).reverse(),
    });
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleEdit = (event) => () => {
    this.setState({
      currentEvent: event,
      dialogAction: 'edit',
      eventFromDate: new Date(event.eventFromDate.seconds * 1000).toISOString().slice(0,10),
      eventFromTime: new Date(event.eventFromDate.seconds * 1000).toISOString().slice(11,16),
      eventUntilDate: new Date(event.eventUntilDate.seconds * 1000).toISOString().slice(0,10),
      eventUntilTime: new Date(event.eventUntilDate.seconds * 1000).toISOString().slice(11,16),
      location: event.location,
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
    });
    this.handleOpen();
  }

  handleClose = () => {
    this.setState({
      open: false,
      // eventFromDate: '',
      // eventFromTime: '',
      // eventUntilDate: '',
      // eventUntilTime: '',
      // location: '',
      // title: '',
      // description: '',
      // imageUrl: '',
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
	      this.setState({
                imageUrl: url,
                openProgress: false
              });
	      this.writeEvent();
	    });
	});
    } else {
      this.setState({ imageUrl: "https://firebasestorage.googleapis.com/v0/b/wayra-events.appspot.com/o/event-placeholder.png?alt=media&token=42fe7a5f-bcb5-40f5-b224-8e5ee8cd1f47" });
      this.writeEvent();
    }
    this.handleClose();
  }

  writeEvent = () => {
    if (this.state.dialogAction === 'add') {
      this.props.firebase.events().add({
	createdAt: this.props.firebase.fieldValue.serverTimestamp(),
        eventFromDate: this.props.firebase.timestamp.fromDate(new Date(`${this.state.eventFromDate}T${this.state.eventFromTime}`)),
        eventUntilDate: this.props.firebase.timestamp.fromDate(new Date(`${this.state.eventFromDate}T${this.state.eventUntilTime}`)),
        location: this.state.location,
	title: this.state.title,
	description: this.state.description,
	imageUrl: this.state.imageUrl,
      });
    } else {
      if (this.state.imageUrl === '') {
	this.setState({ imageUrl: "https://firebasestorage.googleapis.com/v0/b/wayra-events.appspot.com/o/event-placeholder.png?alt=media&token=42fe7a5f-bcb5-40f5-b224-8e5ee8cd1f47" });
      }
      this.props.firebase.event(this.state.currentEvent.uid).update({
        eventFromDate: this.props.firebase.timestamp.fromDate(new Date(`${this.state.eventFromDate}T${this.state.eventFromTime}`)),
        eventUntilDate: this.props.firebase.timestamp.fromDate(new Date(`${this.state.eventFromDate}T${this.state.eventUntilTime}`)),
        location: this.state.location,
	title: this.state.title,
	description: this.state.description,
        imageUrl: this.state.imageUrl,
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
    const {
      loading,
      events,
      eventsUpcoming,
      eventsPassed,
      open,
      openProgress,
      value
    } = this.state;

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
		name="eventFromDate"
		type="text"
		label="Event Date"
		placeholder="YYYY-MM-DD"
		value={this.state.eventFromDate}
		onChange={this.handleChange}
		fullWidth
	      />
	      <TextField
		name="eventFromTime"
		type="text"
		label="Event Start Time"
		placeholder="HH:MM"
		value={this.state.eventFromTime}
		onChange={this.handleChange}
		fullWidth
	      />
	      <TextField
		name="eventUntilTime"
		type="text"
		label="Event End Time"
		placeholder="HH:MM"
		value={this.state.eventUntilTime}
		onChange={this.handleChange}
		fullWidth
	      />
	      <TextField
		name="location"
		type="text"
		label="Location"
		placeholder="Enter location"
		value={this.state.location}
		onChange={this.handleChange}
		fullWidth
	      />
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
                multiline
		fullWidth
	      />
              <p style={{ marginTop: 15, marginBottom: 10 }}>Upload Event Image or choose an image link</p>
              <input type="file" ref={this.setRef} />
	      <TextField
		name="imageUrl"
		type="text"
		label="Image Url"
		placeholder="Enter image URL"
		value={this.state.imageUrl}
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
		   {isMobileDevice()
		    ?
		    <div>
		      {eventsUpcoming.map(evt => (
			<Card
			  style={styles.card} 
			  disableTypography={true}
			>
			  <CardActionArea>
                            <CardContent>
			      <h3>{new Date(evt.eventFromDate.seconds*1000).toDateString()}</h3>
			      <h4>{new Date(evt.eventFromDate.seconds*1000).toTimeString().slice(0,5)} - {new Date(evt.eventUntilDate.seconds*1000).toTimeString().slice(0,5)}</h4>
                              <h4>{evt.location}</h4>
                            </CardContent>
                            <CardMedia
                              image={evt.imageUrl}
                              style={styles.cardMedia}
                            />
                            <CardContent>
			      <h2>{evt.title}</h2>
			      <div
                                disableTypography={true}
                                dangerouslySetInnerHTML={{__html: evt.description}}
                                style={styles.eventDescriptionCard}
                              />
                            </CardContent>
                          </CardActionArea>
                          <CardActions>
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
			  </CardActions>
                        </Card>
		      ))
		      }
		    </div>
		    :
		    <List>
		      {eventsUpcoming.map(evt => (
			<div>
			  <ListItem alignItems="flex-start">
			    <ListItemAvatar>
			      <img src={evt.imageUrl} alt="" style={styles.image} />
			    </ListItemAvatar>
			    <ListItemText
			      primary={
				<div>
				  <span>{new Date(evt.eventFromDate.seconds*1000).toDateString()}</span>
				  <p>{new Date(evt.eventFromDate.seconds*1000).toTimeString().slice(0,5)} - {new Date(evt.eventUntilDate.seconds*1000).toTimeString().slice(0,5)}</p>
				</div>
                              }
			      secondary={evt.location}
			      style={{ width: '40%'}}
			    />
			    <ListItemText
			      primary={evt.title}
			      secondary={<div dangerouslySetInnerHTML={{__html: evt.description}} />}
			      style={{ width: '100%'}}
			    />
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
			  </ListItem>
			  <Divider variant="inset" component="li" />
		        </div>
		      ))}
		    </List>
		   }
		 </div>
		 <div value={value} index={1} hidden={value !== 1}>
		   {isMobileDevice()
		    ?
		    <div>
		      {eventsPassed.map(evt => (
			<Card
			  style={styles.card} 
			  disableTypography={true}
			>
			  <CardActionArea>
                            <CardContent>
			      <h3>{new Date(evt.eventFromDate.seconds*1000).toDateString()}</h3>
			      <h4>{new Date(evt.eventFromDate.seconds*1000).toTimeString().slice(0,5)} - {new Date(evt.eventUntilDate.seconds*1000).toTimeString().slice(0,5)}</h4>
                              <h4>{evt.location}</h4>
                            </CardContent>
                            <CardMedia
                              image={evt.imageUrl}
                              style={styles.cardMedia}
                            />
                            <CardContent>
			      <h2>{evt.title}</h2>
			      <div
                                disableTypography={true}
                                dangerouslySetInnerHTML={{__html: evt.description}}
                                style={styles.eventDescriptionCard}
                              />
                            </CardContent>
                          </CardActionArea>
                          <CardActions>
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
			  </CardActions>
                        </Card>
		      ))
		      }
		    </div>
		    :
		    <List>
		      {eventsPassed.map(evt => (
			<div>
			  <ListItem alignItems="flex-start">
			    <ListItemAvatar>
			      <img src={evt.imageUrl} alt="" style={styles.image} />
			    </ListItemAvatar>
			    <ListItemText
			      primary={
				<div>
				  <span>{new Date(evt.eventFromDate.seconds*1000).toDateString()}</span>
				  <p>{new Date(evt.eventFromDate.seconds*1000).toTimeString().slice(0,5)} - {new Date(evt.eventUntilDate.seconds*1000).toTimeString().slice(0,5)}</p>
				</div>
                              }
			      secondary={evt.location}
			      style={{ width: '40%'}}
			    />
			    <ListItemText
			      primary={evt.title}
			      secondary={<div dangerouslySetInnerHTML={{__html: evt.description}} />}
			      style={{ width: '100%'}}
			    />
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
			  </ListItem>
			  <Divider variant="inset" component="li" />
		        </div>
		      ))}
		    </List>
		   }
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
