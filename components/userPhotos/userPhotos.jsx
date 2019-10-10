import React from 'react';
import './userPhotos.css';
import { Link } from "react-router-dom";
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of Photon (Founder: Jack Nichols)
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      currUser: this.props.currUser,
      currComment: ''
    };
    this.changeComment = this.changeComment.bind(this);
  }

  componentDidMount() {
    var id = this.props.match.params.userId;
    axios.get('/photosOfUser/' + id)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  deleteComment(currComment, currPhoto) {
    axios.post('/deleteComment/' + currComment._id, { photoId: currPhoto._id })
      .then(() => {
        axios.get('/photosOfUser/' + this.props.match.params.userId)
          .then((response) => {
            this.setState({ photos: response.data });
          });
      })
      .catch(function (error) {
        alert(error);
      });
  }

  addDeleteButton(currComment, currPhoto) {
    if (currComment.user._id === this.state.currUser._id) {
      return <button className="cs142-userPhotos-delete" onClick={() => this.deleteComment(currComment, currPhoto)}>Delete</button>;
    }
  }

  getComments(currPhoto) {
    if (typeof currPhoto.comments === 'undefined') {
      return;
    }
    var comments = currPhoto.comments;
    var commentsList = [];
    for (var i = 0; i < comments.length; i++) {
      var currComment = comments[i];
      var nameString = currComment.user.first_name + " " + currComment.user.last_name + ": ";
      var link = "/users/" + currComment.user._id;
      var name = <Link to={link} className="cs142-userPhotos-name">{nameString}</Link>;
      var commentText = <div className="cs142-userPhotos-commentText">{currComment.comment}</div>;
      var creationDate = <div className="cs142-userPhotos-date2"> ({currComment.date_time})</div>;
      var oneComment = <li key={i}>{name}{commentText}{creationDate}{this.addDeleteButton(currComment, currPhoto)}</li>;
      commentsList.push(oneComment);
    }
    return <ul>{commentsList}</ul>;
  }

  changeComment(event) {
    this.setState({currComment: event.target.value});
  }

  submitComment(photoID) {
    axios.post('/commentsOfPhoto/' + photoID, { comment: this.state.currComment })
      .then(() => {
        // a new axios request allows immediate re-rendering with the new comment
        axios.get('/photosOfUser/' + this.props.match.params.userId)
          .then((response) => {
            this.setState({ photos: response.data });
          });
        document.getElementById(photoID).value = ""; // clear input field
      })
      .catch(function (error) {
        alert(error);
      });
  }

  addComment(currPhoto) {
    var currValue;
    var textField = <input
      className="cs142-userPhotos-input"
      type="text"
      id={currPhoto._id}
      value={currValue}
      onChange={this.changeComment} />;
    var button = <button className="cs142-userPhotos-button" onClick={() => this.submitComment(currPhoto._id)}>Comment</button>;
    return <div className="cs142-userPhotos-inputLine">{textField}{button}{this.deleteButton(currPhoto)}</div>
  }

  deletePhoto(currPhoto) {
    axios.post('/deletePhoto/' + currPhoto._id)
      .then(() => {
        axios.get('/photosOfUser/' + this.props.match.params.userId)
          .then((response) => {
            this.setState({ photos: response.data });
          });       
      })
      .catch(function (error) {
        alert(error);
      });
  }

  deleteButton(currPhoto) {
    if (currPhoto.user_id === this.state.currUser._id) {
      return <button className="cs142-userPhotos-delete2" onClick={() => this.deletePhoto(currPhoto)}>Delete Image</button>;
    }
  }

  likePhoto(currPhoto) {
    // tell the server to add this username to the list
    axios.post('/like/' + currPhoto._id)
      .then(() => {
        axios.get('/photosOfUser/' + this.props.match.params.userId)
          .then((response) => {
            this.setState({ photos: response.data });
          });    
      })
      .catch(function (error) {
        alert(error);
      });
  }

  unlikePhoto(currPhoto) {
    // tell the server to remove this username from the list
    axios.post('/unlike/' + currPhoto._id)
      .then(() => {
        axios.get('/photosOfUser/' + this.props.match.params.userId)
          .then((response) => {
            this.setState({ photos: response.data });
          });       
      })
      .catch(function (error) {
        alert(error);
      });
  }

  addToFavorites(currPhoto) {
    axios.post('/addFavorite', {photo: currPhoto})
      .then(() => {
        axios.get('/user/' + this.state.currUser._id)
          .then((response) => {
            this.setState({ currUser: response.data });
          });       
      })
      .catch(function (error) {
        alert(error)
      });
  }

  favoriteButton(currPhoto) {
    var favorited = false;
    for (var i = 0; i < this.state.currUser.favorites.length; i++) {
      if (currPhoto._id === this.state.currUser.favorites[i]._id) {
        favorited = true;
      }
    }
    if (favorited) {
      return <div className="cs142-userPhotos-favorited">Favorited!</div>;
    } else {
      return <button className="cs142-userPhotos-favorite" onClick={() => this.addToFavorites(currPhoto)}>Favorite</button>;
    }
  }

  likeDislikeFav(currPhoto) {
    var userLiked = false;
    for (var i = 0; i < currPhoto.likes.length; i++) {
      if (currPhoto.likes[i] == this.state.currUser._id) {
        userLiked = true;
      }
    }
    var button;
    if (userLiked) {
      button = <button className="cs142-userPhotos-unliking" onClick={() => this.unlikePhoto(currPhoto)}>Unlike</button>;
    } else {
      button = <button className="cs142-userPhotos-liking" onClick={() => this.likePhoto(currPhoto)}>Like</button>;
    }
    return (
      <div className="cs142-userPhotos-stuff">
        {button}
        <div className="cs142-userPhotos-number">{currPhoto.likes.length}</div>
        {this.favoriteButton(currPhoto)}
      </div>
    );
  }

  displayPhotos() {
    // begin by sorting the user's photos...
    this.state.photos.sort(function(a, b) {
      var difference = b.likes.length - a.likes.length;
      if (difference !== 0) { // # of likes
        return difference;
      }
      if (a.date_time > b.date_time) { // date posted
        return -1;
      }
      return 1;
    });
    var photosList = [];
    for (var i = 0; i < this.state.photos.length; i++) {
      var currPhoto = this.state.photos[i];
      var source = "./images/" + currPhoto.file_name;
      var image = <img className="cs142-userPhotos-image" src={source}/>;
      var creationDate = <div className="cs142-userPhotos-date">Posted: {currPhoto.date_time}</div>
      var onePhoto = <li key={i}>{image}{creationDate}{this.likeDislikeFav(currPhoto)}{this.getComments(currPhoto)}{this.addComment(currPhoto)}</li>;
      photosList.push(onePhoto);
    }
    return <ul>{photosList}</ul>;
  }

  render() {
    return (
      <div className="left-align col s7">
      {this.displayPhotos()}
      </div>
    );
  }
}

export default UserPhotos;
