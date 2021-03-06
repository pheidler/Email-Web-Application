import React, {useState, useEffect} from 'react';
import {useHistory} from 'react-router-dom';

import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';

import SharedContext from './SharedContext';

/**
 * A full fledged web app
 * @param {object} props
 * @return {object} JSX
 */
function PersonalAvatar(props) {
  const email = props.email;
  const name = props.name;
  const styleName = props.styleName;
  const isProfilePage = props.isProfilePage;
  const history = useHistory();
  const item = localStorage.getItem('user');
  const storedInfo = JSON.parse(item);
  const bearerToken = storedInfo ? storedInfo.accessToken : '';
  const bearerEmail = email ? email.replace(/\@/g, '%40') : '';
  const [picture, setPicture] = useState('');
  const {user} = React.useContext(SharedContext);

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
          if (json.showavatar || isProfilePage) {
            setPicture(json['profilepicture']);
          }
        })
        .catch((error) => {
          if (error.status >= 400) {
            history.push('/');
          }
          console.log(error.toString());
        });
  }, [picture, user]);
  return (
    <>
      {
      (picture) ?
      <Avatar
        className={styleName}
        src={picture}>
      </Avatar> :
      <Avatar className={styleName}>
        {name ? name[0] : ''}
      </Avatar>
      }
    </>
  );
}

PersonalAvatar.propTypes = {
  email: PropTypes.string,
  name: PropTypes.string,
  styleName: PropTypes.string,
  isProfilePage: PropTypes.bool,
};

export default PersonalAvatar;
