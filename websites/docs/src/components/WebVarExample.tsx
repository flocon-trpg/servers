import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

const codeStyle: React.CSSProperties = {
whiteSpace: 'nowrap', overflowX: 'auto'
}

type Props = {
  keyName: string;
  value: string;
  valueOfDotEnv?: string;
  descriptionOfDotEnv?: string;
  valueOfVercel?: string;
  descriptionOfVercel?: string;
}

export const WebVarExample = ({
  keyName,
  value,
  valueOfDotEnv,
  descriptionOfDotEnv,
  valueOfVercel,
  descriptionOfVercel,
}: Props) => {
  return (
    <Tabs groupId="envType">
      <TabItem value="dotenv" label=".env.local, .env">
        <p style={codeStyle}>
          <code>
            {keyName}={valueOfDotEnv ?? value}
          </code>
        </p>
        {descriptionOfDotEnv == null ? null : <p>{descriptionOfDotEnv}</p>}
      </TabItem>
      <TabItem value="vercel" label="Vercel">
        <p>
          KEY: <code>{keyName}</code>
          <br />
          VALUE: <code>{valueOfVercel ?? value}</code>
        </p>
        {descriptionOfVercel == null ? null : <p>{descriptionOfVercel}</p>}
      </TabItem>
    </Tabs>
  );
};
