import React from "react";

import "./UsersList.css";
import UserItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card";

const UsersList = props => {
  if (props.items.length) {
    return (
      <ul className="users-list">
        {props.items.map(user => (
          <UserItem key={user.id} id={user.id} image={user.image} name={user.name} placeCount={user.places} />
        ))}
      </ul>
    );
  } else {
    return (
      <div className="center">
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  }
};

export default UsersList;