import React from 'react';
import './loginRegister.css';
import axios from 'axios';

/**
 * Define LoginRegister, a React componment of Photon (Founder: Jack Nichols)
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      pass: "",
      errMsg: ""
    };
    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.login = this.login.bind(this);
  }

  userChange(event) {
    this.setState({user: event.target.value});
  }

  passChange(event) {
    this.setState({pass: event.target.value});
  }

  login() {
    axios.post('/admin/login', 
      { login_name: this.state.user, password: this.state.pass })
      .then((response) => {
        this.props.loginUser(response.data);
        this.props.history.push('/users/' + response.data._id);
      })
      .catch(function () {
        alert('Username or password was not correct (HTTP Response Status of 400 - Bad Request)');
      });
  }

  clearInputs() {
    document.getElementById("first").value = "";
    document.getElementById("last").value = "";
    document.getElementById("location").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("occ").value = "";
    document.getElementById("login").value = "";
    document.getElementById("pass1").value = "";
    document.getElementById("pass2").value = "";
  }

  register(first, last, location, desc, occ, login, pass1, pass2) {
    if (pass1 !== pass2) {
      this.setState({errMsg: "Registration failed: passwords do not match"});
      this.clearInputs();
      return;
    }
    axios.post('/user', 
      {login_name: login, password: pass1, first_name: first, last_name: last,
        location: location, description: desc, occupation: occ})
      .then(() => {
        this.setState({errMsg: "Registration Success!"});
        this.clearInputs();
      })
      .catch((error) => {
        this.clearInputs();
        if (error.response.data === 'Blank inputs') {
          this.setState({errMsg: "Registration failed: please enter a first name, last name, username, and password"});
        } else if (error.response.data === 'Existing user') {
          this.setState({errMsg: "Registration failed: username already exists"});
        } else {
          alert(error);
        }
      });
  }

  render() {
    var first;
    var last;
    var location;
    var desc;
    var occ;
    var login;
    var pass1;
    var pass2;
    return (
      <div className="left-align">
        <div className="cs142-login-all">
          <div className="cs142-login-inputs">
            <label className="cs142-login-label">Username</label>
            <input 
              className="cs142-login-text"
              type="text"
              onChange={this.userChange} 
            />
          </div>
          <div className="cs142-login-inputs">
            <label className="cs142-login-label">Password</label>
            <input
              className="cs142-login-text"
              type="password"
              onChange={this.passChange}
            />
            <button className="cs142-login-button" onClick={this.login}>Login</button>
          </div>
        </div>

        <div className="cs142-register-all">
          <label className="cs142-register-header">New User?</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={first}
            id="first"
            onChange={ event => { first = event.target.value; }}
          />
          <label className="cs142-register-title">First Name</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={last}
            id="last"
            onChange={ event => { last = event.target.value; }}
          />
          <label className="cs142-register-title">Last Name</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={location}
            id="location"
            onChange={ event => { location = event.target.value; }}

          />
          <label className="cs142-register-title">Location</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={desc}
            id="desc"
            onChange={ event => { desc = event.target.value; }}

          />
          <label className="cs142-register-title">Description</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={occ}
            id="occ"
            onChange={ event => { occ = event.target.value; }}
          />
          <label className="cs142-register-title">Occupation</label>
          <input 
            className="cs142-register-text"
            type="text"
            value={login}
            id="login"
            onChange={ event => { login = event.target.value; }}
          />
          <label className="cs142-register-title">Username</label>
          <input 
            className="cs142-register-text"
            type="password"
            value={pass1}
            id="pass1"
            onChange={ event => { pass1 = event.target.value; }}
          />
          <label className="cs142-register-title">Password</label>
          <input 
            className="cs142-register-text"
            type="password"
            value={pass2}
            id="pass2"
            onChange={ event => { pass2 = event.target.value; }}
          />
          <label className="cs142-register-title">Confirm Password</label>                                     
        </div>
        <div className="cs142-register-error">{this.state.errMsg}</div>
        <button className="cs142-register-button" onClick={() => this.register(first, last, location, desc, occ, login, pass1, pass2)}>Register Me!</button>
      </div>

    );
  }
}

export default LoginRegister;
