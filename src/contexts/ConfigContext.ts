import React from 'react';
import { getConfig } from '../config';

const ConfigContext = React.createContext(getConfig());

export default ConfigContext;
