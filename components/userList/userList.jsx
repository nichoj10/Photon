import React from 'react';
import './userList.css';
import { Link } from "react-router-dom";
import axios from 'axios';



/**
 * Define UserList, a React componment of Photon (Founder: Jack Nichols)
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: '',
    };
  }

  componentDidMount() {
    axios.get('/user/list')
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  displayUsers() {
    var nameList = [];
    for (var i = 0; i < this.state.users.length; i++) {
      var user = this.state.users[i];
      var link = "/users/" + user._id;
      var linkTag = <Link to={link}>{user.first_name + " " + user.last_name}</Link>;
      <button className="cs142-userDetail-yes" onClick={() => {this.deleteAccount()}}>Yes</button>
      nameList.push(<li key={user._id} className="collection-item">{linkTag}</li>);
    }
    return <ul className="cs142-userList-list">{nameList}</ul>;
  }

  render() {
    return (
      <div className="userlist collection col s4 z-depth-2">
        <div className="cs142-userList-header">USERS</div>
        <div>{this.displayUsers()}</div>
      </div>
    );
  }
}

export default UserList;
