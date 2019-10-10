// Welcome to Photon, founded by Jack Nichols.

import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import axios from 'axios';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';
import Favorites from './components/favorites/Favorites';

import './node_modules/materialize-css/dist/css/materialize.css';
import './styles/main.css';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inSession: false,
      currUser: {},
    };
    this.loginUser = this.loginUser.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  loginUser(user) {
    this.setState({ inSession: true });
    this.setState({ currUser: user });
  }

  logoutUser() {
    this.setState({ inSession: false });
    this.setState({ currUser: {} });
  }

  updateUser() {
    axios.get('/user/' + this.state.currUser._id)
      .then((response) => {
        this.setState({ currUser: response.data});
      })
      .catch(function (error) {
        alert(error);
      });
  }

  render() {
    var isLoggedIn = this.state.inSession;
    return (
      <HashRouter>
      <div>
        <Route
        render={ props => <TopBar logoutUser={this.logoutUser} inSession={this.state.inSession}
          currUser={this.state.currUser}{...props} /> }
        />
        <div className="row">
          {
            isLoggedIn ?
              <UserList />
            :
              <div></div>
          }
          <div className="center-align">
              {
                isLoggedIn ?
                  <Route path="/" />
                :
                  <Redirect path="/" to="/login-register" />
              }
            <Switch>
              {
                isLoggedIn ?
                  <Route path="/users/:userId"
                    render={ props => <UserDetail currUser={this.state.currUser} logoutUser={this.logoutUser}{...props} /> } 
                  />
                :
                  <Redirect path="/users/:userId" to="/login-register" />
              }
              {
                isLoggedIn ?
                  <Route path="/photos/:userId"
                    render={ props => <UserPhotos currUser={this.state.currUser} {...props} /> }
                  />
                :
                  <Redirect path="/photos/:userId" to="/login-register" />
              }
              {
                isLoggedIn ?
                  <Route path="/users" component={UserList}  />
                :
                  <Redirect path="/users" to="/login-register" />
              }
              {
                isLoggedIn ?
                  <Route path="/favorites" 
                    render={props => <Favorites currUser={this.state.currUser} updateUser={this.updateUser} {...props} /> }
                  />
                :
                  <Redirect path="/favorites" to="/login-register" />
              }              
              <Route path="/login-register"
                render={ props => <LoginRegister loginUser={this.loginUser} {...props} /> }
              />
            </Switch>
          </div>
        </div>
      </div>
    </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
