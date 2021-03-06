import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import PersonalAvatar from './PersonalAvatar';
import Favorite from './Favorite';

import Box from '@material-ui/core/Box';
import {useHistory} from 'react-router-dom';


import SharedContext from './SharedContext';

const useStyles = makeStyles((theme) => ({
  block: {
    display: 'block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  emailList: {
    width: '100%',
    height: '100vh',
  },
  dateColumn: {
    minWidth: '15%',
    display: 'block',
    position: 'relative',
  },
  starIcon: {
    marginTop: '10px',
    marginLeft: '30px',
  },
  mainAvatar: {
    marginLeft: '-10px',
    marginRight: '10px',
    marginTop: '10px',
  },
  bold: {
    fontWeight: 'bold',
  },
  outer: {
    width: '100%',
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
    display: 'block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  inner: {
    display: 'block',

  },
  emailDate: {
    marginLeft: '-10px',
  },

}));


/**
 * @return {object} JSX
 */
function EmailList() {
  const {mailbox,
    setSelectedEmail} = React.useContext(SharedContext);
  const [mail, setMail] = useState([]);
  const history = useHistory();
  const currentDate = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];

  const item = localStorage.getItem('user');
  if (!item) {
    console.log('Not signed in!');
    return;
  }
  const storedInfo = JSON.parse(item);
  const bearerToken = storedInfo ? storedInfo.accessToken : '';

  /* API call to get emails */
  useEffect(async () => {
    await fetch(`http://localhost:3010/v0/mail?mailbox=${mailbox}`, {
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
          setMail(json);
        })
        .catch((error) => {
          if (error.status >= 400) {
            history.push('/');
          }
          console.log(error.toString());
        });
  }, [mailbox]);
  const sortedEmails = mail.sort((a, b) => {
    const bDate = new Date(b.received);
    const aDate = new Date(a.received);
    return bDate - aDate;
  });
  const classes = useStyles();
  return (
    <List
      className={classes.emailList}
      component="nav"
      aria-label="main mailbox folders">
      {sortedEmails.map((email) => (
        /* https://codesandbox.io/s/si9yq?file=/demo.js:2241-2356 */
        <ListItem
          key={email.id}
          button
          alignItems="flex-start"
          onClick={() => viewEmail(email)}>
          <Box className={classes.outer}>
            <Box className={classes.inner}>
              <PersonalAvatar
                email={email['from']['email']}
                name={email['from']['name']}
                styleName={classes.mainAvatar}/>
            </Box>
            <Box className={classes.grow}>
              {
              email.unread ?
              <>
                <Typography
                  color="textPrimary"
                  className={classes.bold}>
                  {email.from.name}
                </Typography>
                <Typography
                  color="textPrimary"
                  className={classes.bold}>
                  {email.subject}
                </Typography>
              </> :
                <>
                  <Typography
                    color="textPrimary">
                    {email.from.name}
                  </Typography>
                  <Typography
                    color="textPrimary">
                    {email.subject}
                  </Typography>
                </>
              }

              <Typography
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {email.content}
              </Typography>
            </Box>


            <Box className={classes.inner}>
              <Typography
                component="span"
                variant="body2"
                color="textPrimary"
                className={classes.emailDate}>
                {parseDate(email.received)}
              </Typography>
              <br></br>
              <Favorite
                className={classes.star}
                onClick={()=>handleStarredClick}
                email={email}/>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );

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

  /**
   * View email
   * @param {object} email
   */
  async function viewEmail(email) {
    email.unread = false;
    email.mailbox = mailbox;

    await fetch(`http://localhost:3010/v0/mail/${email['id']}`, {
      method: 'POST',
      body: JSON.stringify(email),
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


    setSelectedEmail(email);
    history.push('/mailView');
  }
}

export default EmailList;
