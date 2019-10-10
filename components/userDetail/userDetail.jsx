import React from 'react'; 
import './userDetail.css';
import { Link } from "react-router-dom";
import axios from 'axios';

/**
 * Define UserDetail, a React componment of Photon (Founder: Jack Nichols)
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      showWarning: false
    };
  }

  componentDidMount() {
    var id = this.props.match.params.userId;
    axios.get('/user/' + id)
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  componentDidUpdate(prevProps) {
    var id = this.props.match.params.userId;
    if (id !== prevProps.match.params.userId) {
      axios.get('/user/' + id)
        .then((response) => {
          this.setState({ user: response.data });
        })
        .catch(function (error) {
          alert(error);
        });
      }
  }

  displayLink() {
    var link = "/photos/" + this.props.match.params.userId;
    return <Link style={{ color: 'white' }} to={link}>Photos</Link>;
  }
  
  displayName() {
    return this.state.user.first_name + " " + this.state.user.last_name;
  }

  displayLocation() {
    return <div className="cs142-userDetail-elem"><b>Location: </b>{this.state.user.location}</div>
  }

  displayOccupation() {
    return <div className="cs142-userDetail-elem"><b>Occupation: </b>{this.state.user.occupation}</div>
  }

  displayDescription() {
    return <div className="cs142-userDetail-elem"><b>Description: </b>{this.state.user.description}</div>
  }

  deleteAccount() {
    // makes a request to the database to remove this user
    axios.post('/deleteUser/' + this.props.currUser._id)
      .then(() => {
        this.props.logoutUser();
        this.props.history.push('/login-register');
      })
      .catch(function (error) {
        alert(error);
      });
  }

  finalWarning() {
    if (this.state.user._id === this.props.currUser._id && this.state.showWarning === true) {
      return (
        <div className="cs142-userDetail-warnMessage">Are you sure?
          <button className="cs142-userDetail-yes" onClick={() => {this.deleteAccount()}}>Yes</button>
          <button onClick={() => { this.setState({showWarning: false}); } }>No</button>
        </div>
      );
    }
  }

  deleteButton() {
    if (this.state.user._id === this.props.currUser._id) {
      return <button className="cs142-userDetail-delete" onClick={() => { this.setState({showWarning: true}); } }>Delete Account</button>;
    }
  }

  render() {
    return (
      <div className="left-align col s7">
        <div className="cs142-userDetail-link">{this.displayLink()}</div>
        <div className="cs142-userDetail-name">{this.displayName()}</div>
        <div className="cs142-userDetail-info">
          {this.displayLocation()}
          {this.displayOccupation()}
          {this.displayDescription()}
        </div>
        <div>{this.deleteButton()}</div>
        <div className="cs142-userDetail-warning">{this.finalWarning()}</div>
      </div>
    );
  }
}

export default UserDetail;