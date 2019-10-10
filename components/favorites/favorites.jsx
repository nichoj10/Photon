import React from 'react';
import './favorites.css';
import axios from 'axios';
import Modal from 'react-modal';

// display the User's favorited photos
class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favPhotos: [],
      modalIsOpen: false,
      modalImage: {}
    };
  }

  componentDidMount() {
    axios.get('/getFavorites')
      .then((response) => {
        this.setState({ favPhotos: response.data });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  remove(currPhoto) {
    axios.post('/deleteFavorite/' + currPhoto._id)
      .then(() => {
        axios.get('/getFavorites')
          .then((response) => {
            this.setState({ favPhotos: response.data });
          });
        this.props.updateUser();
      })
      .catch(function (error) {
        alert(error);
      });
  }

  openModal(currPhoto) {
    this.setState({modalImage: currPhoto});
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  displayThumbnails() {
    // using const to avoid re-definitions within the for loop
    const photosList = [];
    for (var i = 0; i < this.state.favPhotos.length; i++) {
      const currPhoto = this.state.favPhotos[i];
      const source = "./images/" + currPhoto.file_name;
      const image = <img width="auto" height="150" src={source} onClick={() => this.openModal(currPhoto)} />;
      const button = <button className="cs142-favorites-button" onClick={() => this.remove(currPhoto)}>X</button>;
      const item = <div className="cs142-favorites-container">{image}{button}</div>;
      const listItem = <li className="cs142-favorites-item" key={i}>{item}</li>;
      photosList.push(listItem);
    }
    return <ul className="cs142-favorites-list">{photosList}</ul>;
  }

  displayModalImage() {
    var photo = this.state.modalImage;
    var source = "./images/" + photo.file_name;
    var image = <img className="cs142-favorites-modalImage" width="500" height="auto" src={source}/>;
    var caption = <div className="cs142-favorites-caption">Posted: {photo.date_time}</div>;
    var item = <div>{image}{caption}</div>;
    return item;
  }

  render() {
    return (
      <div>
        <div className="left-align col s7">
          <div className="cs142-favorites-title">{this.props.currUser.first_name}&apos;s Favorites</div>
          {this.displayThumbnails()}
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          className="cs142-favorites-modal"
          ariaHideApp={false}
        >
          {this.displayModalImage()}
          <button className="cs142-favorites-closeModal" onClick={() => this.closeModal()}>Close</button>
        </Modal>
      </div>
    );
  }
}

export default Favorites;
