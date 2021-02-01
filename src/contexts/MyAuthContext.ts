import React from 'react';
import firebase from 'firebase/app';

const MyAuthContext = React.createContext(null as firebase.User | null);

export default MyAuthContext;