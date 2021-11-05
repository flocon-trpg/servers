import React from 'react';
import { getConfig } from '../config';

export const ConfigContext = React.createContext(getConfig());
