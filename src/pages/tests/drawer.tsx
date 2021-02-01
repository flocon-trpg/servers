import { Drawer } from 'antd';
import React from 'react';

type SubDrawerProps = {
    isVisible: boolean;
    setIsVisible: (newValue: boolean) => void; 
}

const SubDrawer: React.FC<SubDrawerProps> = (props:SubDrawerProps) => {
    return <Drawer closable visible={props.isVisible} onClose={() => props.setIsVisible(false)}>
        sub drawer
    </Drawer>;
};

const MainDrawer: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <>
            <div>
                <a onClick={() => setIsVisible(oldValue => !oldValue)}>sub</a>
            </div>
            <SubDrawer isVisible={isVisible} setIsVisible={setIsVisible} />
        </>);
};

const Main: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    return <div>
        <a onClick={() => setIsVisible(oldValue => !oldValue)}>main</a>
        <Drawer closable visible={isVisible} onClose={() => setIsVisible(false)}>
            <MainDrawer />
        </Drawer>
    </div>;
};

export default Main;