import { Button, Layout } from 'antd';

export const ToolsHeader: React.FC = () => {
    return (
        <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
            <Button
                type="text"
                onClick={() => {
                    location.href = '/';
                }}
            >
                <img
                    src="/img/logo.png"
                    style={{ verticalAlign: 'middle' }}
                    width={32}
                    height={32}
                />
                <span style={{ fontWeight: 'bold' }}>{'Flocon'}</span>
            </Button>
            <Button type="text" onClick={() => (location.href = '/tools')}>
                {'ツールTOP'}
            </Button>
        </Layout.Header>
    );
};
