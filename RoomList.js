import React, { Component } from 'react';
import './RoomList.css'

class RoomList extends Component {

constructor(props) {
    super(props);

    this.state = {
    rooms: [],
    newRoomName: ''
  };

this.roomsRef = this.props.firebase.database().ref('rooms');

}

componentDidMount() {
      this.roomsRef.on('child_added', snapshot => {
      const room = snapshot.val();
      room.key = snapshot.key;
      this.setState({ rooms: this.state.rooms.concat( room ) })
      });
    }

createRoom(newRoomName) {
    this.roomsRef.push({
      name: newRoomName,
    });
    this.setState({ newRoomName: '' });
  }

handleChange(event) {
    this.setState({newRoomName: event.target.value });
  }

render () {
  return (
<section>
    <div id='container'>
        <div id='body'>
        <img src={'./public/chitchat.png'} className="background"/>
            <div>
                <h1>ChitChat
                </h1>
                <p>Talk to your friends</p>
                <img src="/text-bubble.jpg"/>
            </div>
        </div>
     </div>
</section>
   );
 }
}

export default RoomList;
