import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const codeStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    overflowX: 'auto',
};

const FlyToml = ({ keyName, value, notRecommended }) => {
    let codeValue: string;
    if (value.includes('"')) {
        if (value.includes("'")) {
            throw new Error('Not supported.');
        }
        codeValue = `'${value}'`;
    } else {
        codeValue = `"${value}"`;
    }
    return (
        <>
            <p style={codeStyle}>
                <code>
                    {keyName}={codeValue}
                </code>
            </p>
            {notRecommended ? (
                <p>
                    この値には、慎重に扱うべきデータが一般的に含まれるため、
                    <code>fly.toml</code>で設定することは推奨されません。fly.io
                    にデプロイする場合は、代わりに<code>flyctl secrets set</code>
                    コマンドを利用することを推奨します。
                </p>
            ) : null}
        </>
    );
};

type Props = {
    keyName: string;
    value: string;
    valueOfHeroku?: string;
    descriptionOfHeroku?: string;
    notRecommendedAtFlyToml?: boolean;
    hideHeroku?: boolean;
};

export const ApiVarExample = ({
    keyName,
    value,
    valueOfHeroku,
    descriptionOfHeroku,
    notRecommendedAtFlyToml,
    hideHeroku,
}: Props) => {
    return (
        <Tabs groupId="envType">
            <TabItem value="fly.toml" label="fly.toml">
                <FlyToml keyName={keyName} value={value} notRecommended={notRecommendedAtFlyToml} />
            </TabItem>
            <TabItem value="flyctl-secrets" label="flyctl secrets set コマンド">
                <p style={codeStyle}>
                    <code>
                        flyctl secrets set {keyName}={value}
                    </code>
                </p>
            </TabItem>
            <TabItem value="dotenv" label=".env.local, .env">
                <p>
                    <code style={codeStyle}>
                        {keyName}={value}
                    </code>
                </p>
            </TabItem>
            <TabItem value="heroku" label="Heroku">
                {hideHeroku ? (
                    <p>
                        この環境変数は、Heroku に対応していないか、Heroku
                        での設定が推奨されていません。
                    </p>
                ) : (
                    <>
                        <p>
                            KEY: <code>{keyName}</code>
                            <br />
                            VALUE: <code>{valueOfHeroku ?? value}</code>
                        </p>
                        {descriptionOfHeroku == null ? null : <p>{descriptionOfHeroku}</p>}
                    </>
                )}
            </TabItem>
        </Tabs>
    );
};
