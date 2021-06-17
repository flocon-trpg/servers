/** @jsxImportSource @emotion/react */
import React from 'react';
import Layout from '../../layouts/Layout';
import { css } from '@emotion/react';

const color = 'skyblue';
const borderRadius = '20px';

const css0 = css`
position: absolute;
top: 100px;
left: 100px;
width: 50px;
height: 8px;
border-radius: ${borderRadius};
background-color: ${color};

transform: rotate(90deg);
`;

const css1 = css`
position: absolute;
top: 100px;
left: 100px;
width: 50px;
height: 8px;
border-radius: ${borderRadius};
background-color: ${color};

transform: rotate(150deg);
`;

const css2 = css`
position: absolute;
top: 100px;
left: 100px;
width: 50px;
height: 8px;
border-radius: ${borderRadius};
background-color: ${color};

transform: rotate(210deg);
`;

const css3 = css`
position: absolute;
top: 72px;
left: 93px;
width: 64px;
height: 64px;
border-radius: 50%;
border: solid 5px ${color};

transform: rotate(210deg);
`;

// TODO:
// 正式公開時に削除する。

const Index: React.FC = () => {
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div css={css0} />
            <div css={css1} />
            <div css={css2} />
            <div css={css3} />
        </Layout>
    );
};

export default Index;