import { Meta, StoryObj } from '@storybook/react';
import { Alert, Divider } from 'antd';
import { AlertCounter, AlertCounterContext } from './AlertCounter';

const symbol = Symbol();

const Main: React.FC<{
    showErrorAlert1: boolean;
    showErrorAlert2: boolean;
    showWarningAlert1: boolean;
    showWarningAlert2: boolean;
    fetching1: boolean;
    fetching2: boolean;
    showInfoAlert: boolean;
}> = ({
    showErrorAlert1,
    showErrorAlert2,
    showWarningAlert1,
    showWarningAlert2,
    fetching1,
    fetching2,
    showInfoAlert,
}) => {
    return (
        <div>
            <h3>Context 外の Counter。Context の外であるというエラーメッセージが出る。</h3>
            <AlertCounter.Counter showIcon />

            <Divider />

            <AlertCounterContext.Provider value={symbol}>
                <h3>Context 内の Counter。こちらは正常にカウントされる</h3>
                <AlertCounter.Counter showIcon />

                <Divider />

                {showErrorAlert1 && (
                    <AlertCounter.Alert message="これはカウント対象" type="error" />
                )}
                {showErrorAlert2 && (
                    <AlertCounter.Alert message="これはカウント対象" type="error" showIcon />
                )}
                {showWarningAlert1 && (
                    <AlertCounter.Alert message="これはカウント対象" type="warning" />
                )}
                {showWarningAlert2 && (
                    <AlertCounter.Alert message="これはカウント対象" type="warning" showIcon />
                )}
                {fetching1 && (
                    <AlertCounter.CountAsLoading>
                        <p>何らかの値を取得中…</p>
                    </AlertCounter.CountAsLoading>
                )}
                {fetching2 && (
                    <AlertCounter.CountAsLoading>
                        <p>何らかの値を取得中…</p>
                    </AlertCounter.CountAsLoading>
                )}
                {showInfoAlert && (
                    <AlertCounter.Alert
                        message="これはContextの中だが、infoなのでカウント対象外"
                        type="info"
                    />
                )}
            </AlertCounterContext.Provider>

            <Divider />

            <Alert message="これはカウント対象外" type="error" />
            <Alert message="これはカウント対象外" type="warning" />
        </div>
    );
};

const meta = {
    title: 'UI/AlertCounter',
    component: Main,
    args: {
        showErrorAlert1: true,
        showErrorAlert2: true,
        showWarningAlert1: true,
        showWarningAlert2: true,
        fetching1: true,
        fetching2: true,
        showInfoAlert: true,
    },
} satisfies Meta<typeof Main>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fetching: Story = {
    args: {
        showErrorAlert1: false,
        showErrorAlert2: false,
        showWarningAlert1: false,
        showWarningAlert2: false,
        fetching1: true,
        fetching2: true,
        showInfoAlert: false,
    },
};

export const NoAlert: Story = {
    args: {
        showErrorAlert1: false,
        showErrorAlert2: false,
        showWarningAlert1: false,
        showWarningAlert2: false,
        fetching1: false,
        fetching2: false,
        showInfoAlert: false,
    },
};
