import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import SharedContext from './SharedContext';
import Toolbar from '@material-ui/core/Toolbar';
import MailIcon from '@material-ui/icons/Mail';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import PersonalAvatar from './PersonalAvatar';
import Typography from '@material-ui/core/Typography';
import ReplyIcon from '@material-ui/icons/Reply';
import Favorite from './Favorite';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';


import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
  },
  paper: {
    flexGrow: 1,
    padding: theme.spacing(1),
    width: '100%',
    height: '100vh',
  },
  saveMailbox: {
    color: 'black',
    marginLeft: '5px',
  },
  mailbox: {
    backgroundColor: 'lightgrey',
    position: 'relative',
    width: '15%',
    textAlign: 'center',
    marginTop: '-10px',
  },
  userInfo: {
    textAlign: 'left',
    marginTop: '10px',
  },
  profilePicture: {
    marginLeft: '10px',
    marginTop: '10px',
    width: '55px',
    height: '55px',
  },
  avatar: {
    alignItems: 'center',
  },
  gridIcons: {
    display: 'block',
  },
  replyIcon: {
    marginTop: '10px',
    marginLeft: '20px',
  },
  content: {
    marginTop: '10px',
    marginLeft: '20px',
  },
}));
/**
 * A full fledged web app
 *
 * @return {object} JSX
 */
function ViewEmail() {
  const classes = useStyles();
  const {selectedEmail,
    mailbox, setMailbox, user, setUser} = React.useContext(SharedContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();
  const item = localStorage.getItem('user');
  const storedInfo = JSON.parse(item);
  const bearerToken = storedInfo ? storedInfo.accessToken : '';
  const bearerEmail = storedInfo ? storedInfo.email.replace(/\@/g, '%40') : '';
  const currentDate = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];


  /* If user manually refreshes, just return to inbox view */
  if (Object.keys(selectedEmail).length === 0 || selectedEmail === undefined) {
    history.push('/main');
    return null;
  }

  let userMailboxes;
  if (Object.keys(user).length === 0 || user === undefined) {
    userMailboxes = [];
  } else {
    userMailboxes = user.mailboxes;
  }
  useEffect(async () => {
    await fetch(`http://localhost:3010/v0/user?email=${bearerEmail}`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    })
        .then((response) => {
          if (!response.ok) {
            throw response;
          }
          return response.json();
        })
        .then((json) => {
          setUser(json);
        })
        .catch((error) => {
          if (error.status >= 400) {
            history.push('/');
          }
          console.log(error.toString());
        });
  }, []);

  /** Click handler for menu
   * https://codesandbox.io/s/sm1zv?file=/demo.js:267-343
   * @param {event} event
   */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /** Click handler for menu
   * @param{string} mailbox
   * https://codesandbox.io/s/sm1zv?file=/demo.js:267-343
   */
  const handleClose = (async (mailbox) => {
    if (typeof(mailbox) === 'string') {
      selectedEmail.mailbox = mailbox;

      await fetch(`http://localhost:3010/v0/mail/${selectedEmail['id']}`, {
        method: 'POST',
        body: JSON.stringify(selectedEmail),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      }).then((response) => {
        if (!response.ok) {
          throw response;
        }
        setMailbox(mailbox);
        return response.json();
      })
          .catch((error) => {
            console.log(error);
            if (error.status >= 401) {
              history.push('/');
            }
            console.log(error.toString());
          });
    }
    setAnchorEl(null);
  });

  return (
    <Paper className={classes.paper}>
      <Toolbar className={classes.header}>
        <Box display="flex" className={classes.header}>
          <Box flexGrow={1}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => history.push('/main')}
            >
              <ArrowBackIosIcon/>
            </IconButton>
          </Box>
          <Box>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => markAsUnread()}
            >
              <MailIcon/>
            </IconButton>
          </Box>
          <Box>
            <IconButton aria-controls="simple-menu"
              className={classes.saveMailbox}
              onClick={handleClick}>
              <SaveAltIcon/>
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {userMailboxes.map((mailbox) => (
                <MenuItem
                  key={mailbox}
                  onClick={() => handleClose(mailbox)}>{mailbox}</MenuItem>
              ))}
            </Menu>
          </Box>
          <Box>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => deleteEmail()}
            >
              <DeleteIcon/>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
      <Grid container>
        <Grid item xs={12} className={classes.subject}>
          <h3>{selectedEmail.subject}</h3>
          <Typography className={classes.mailbox}>{mailbox}</Typography>
        </Grid>
        <Grid item xs={2} className={classes.avatar}>
          <PersonalAvatar
            email={selectedEmail['from']['email']}
            name={selectedEmail['from']['name']}
            styleName={classes.profilePicture}/>
        </Grid>
        <Grid item xs={8} className={classes.userInfo}>
          <Typography>
            {selectedEmail.from.name}
          </Typography>
          <Typography>
            {`${selectedEmail.from.email}
               ${parseDate(selectedEmail.received)}`}
          </Typography>
        </Grid>
        <Grid item xs={2} className={classes.gridIcons}>
          <Favorite email={selectedEmail}/>
          <br></br>
          <ReplyIcon
            className={classes.replyIcon}
            onClick={()=>replyTo()}/>
        </Grid>
      </Grid>
      <Typography className={classes.content}>
        {selectedEmail.content}
      </Typography>
    </Paper>
  );

  /**
   * Reply to selected email
   * @param {object} email
   */
  function replyTo() {
    console.log('Replying to selected email');
  }
  /**
   * Delete email object
   * @param {object} email
   */
  async function deleteEmail() {
    selectedEmail.mailbox = 'Trash';

    await fetch(`http://localhost:3010/v0/mail/${selectedEmail['id']}`, {
      method: 'POST',
      body: JSON.stringify(selectedEmail),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
        .catch((error) => {
          console.log(error);
          if (error.status >= 401) {
            history.push('/');
          }
          console.log(error.toString());
        });
    history.push('/main');
  }
  /**
   * Delete email object
   * @param {object} email
   */
  async function markAsUnread() {
    selectedEmail.mailbox = mailbox;
    selectedEmail.unread = true;

    await fetch(`http://localhost:3010/v0/mail/${selectedEmail['id']}`, {
      method: 'POST',
      body: JSON.stringify(selectedEmail),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
        .catch((error) => {
          console.log(error);
          if (error.status >= 401) {
            history.push('/');
          }
          console.log(error.toString());
        });
  }

  /**
   * Parse date object
   * @param {object} date
   * @return {String} date
   */
  function parseDate(date) {
    const received = new Date(date);
    if (received.getFullYear() < currentDate.getFullYear()) {
      return received.getFullYear();
    } else if (received.getMonth() == currentDate.getMonth() &&
    received.getDate() == currentDate.getDate()) {
      return `${received.getHours()}:${received.getMinutes()}`;
    } else {
      return `${months[received.getMonth()]} ${received.getDate()}`;
    }
  }
};

export default ViewEmail;
