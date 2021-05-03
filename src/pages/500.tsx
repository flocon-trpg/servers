import React from 'react';

const InternalServerError: React.FC = () => {
    // SSGで500は使われるのだろうか？
    return <h1>500 - Internal Server Error</h1>;
};

export default InternalServerError;