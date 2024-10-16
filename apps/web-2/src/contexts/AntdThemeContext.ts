import React from 'react';

export type Value = { compact: boolean };

export const AntdThemeContext = React.createContext<Value>({ compact: false });
