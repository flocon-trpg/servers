import React from 'react';
import PagenationScroll from '../../components/PagenationScroll';

const Main: React.FC = () => {
    return (
        <div>
            <PagenationScroll
                height={500}
                elementMinHeight={50}
                source={new Array(200).fill(true).map((_, i) => (
                    <div key={i} style={{ minHeight: 50 }}>
                        ITEM {i}
                    </div>
                ))}
            />
        </div>
    );
};

export default Main;
