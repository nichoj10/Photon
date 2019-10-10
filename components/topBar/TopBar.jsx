import React from 'react';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React component of Photon (Founder: Jack Nichols)
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.logout = this.logout.bind(this);
    this.handleUpload = (e) => {
      e.preventDefault();
      if (this.uploadInput.files.length > 0) {
        const domForm = new FormData();
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        axios.post('/photos/new', domForm)
          .then((res) => {
            console.log(res);
          })
          .catch(err => console.log(err));
      }
    }
  }

  componentDidMount() {
    axios.get('/test/info')
      .then((response) => {
        this.setState({ version: response.data.__v });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  displayGreeting() {
    if (this.props.inSession) {
      return "Hi " + this.props.currUser.first_name + "!";
    }
  }

  logout() {
    axios.post('/admin/logout')
      .then(() => {
        this.props.logoutUser();
      })
      .catch(function (error) {
        alert(error);
      });
  }

  createLoginButton() {
    if (this.props.inSession) {
      return <button className="cs142-TopBar-logout" onClick={this.logout}>Logout</button>;
    } else {
      return "Please Login";
    }
  }

  createAddButton() {
    if (this.props.inSession) {
      return <button className="cs142-TopBar-upload" onClick={this.handleUpload}>Upload</button>;
    }
  }

  createChooseButton() {
    if (this.props.inSession) {
      return <input style={{ width:'230px'}} type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />;
    }
  }

  goToFavorites() {
    this.props.history.push('/favorites');
  }

  createFavoritesButton() {
    if (this.props.inSession) {
      return <button className="cs142-TopBar-favorites" onClick={() => this.goToFavorites()}>Favorites</button>;
    }
  }

  render() {
    return (
      <nav>
        <div>
          <div className="left" id="cs142-TopBar-greeting">{this.createFavoritesButton()}{this.displayGreeting()}</div>
          <div className="right" id="cs142-TopBar-rightButtons">{this.createChooseButton()}{this.createAddButton()}{this.createLoginButton()}</div>
        </div>
      </nav>
    );
  }
}

export default TopBar;
