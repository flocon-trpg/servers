import React from 'react';
import firebase from 'firebase/app';
import { FirebaseUserState, loading } from '../hooks/useFirebaseUser';

const MyAuthContext = React.createContext(loading as FirebaseUserState);

export default MyAuthContext;