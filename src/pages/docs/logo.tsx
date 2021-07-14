/** @jsxImportSource @emotion/react */
import React from 'react';
import Layout from '../../layouts/Layout';
import { css } from '@emotion/react';

namespace Logo1 {
    const color = 'skyblue';
    const borderRadius = '20px';

    export const css0 = css`
        position: absolute;
        top: 100px;
        left: 100px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(90deg);
    `;

    export const css1 = css`
        position: absolute;
        top: 100px;
        left: 100px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(150deg);
    `;

    export const css2 = css`
        position: absolute;
        top: 100px;
        left: 100px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(210deg);
    `;

    export const css3 = css`
        position: absolute;
        top: 72px;
        left: 93px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: solid 5px ${color};

        transform: rotate(210deg);
    `;
}

namespace Logo2 {
    const color = 'skyblue';
    const borderRadius = '20px';

    export const css0 = css`
        position: absolute;
        top: 100px;
        left: 200px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(90deg);
    `;

    export const css1 = css`
        position: absolute;
        top: 100px;
        left: 200px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(150deg);
    `;

    export const css2 = css`
        position: absolute;
        top: 100px;
        left: 200px;
        width: 50px;
        height: 8px;
        border-radius: ${borderRadius};
        background-color: ${color};

        transform: rotate(210deg);
    `;

    export const css3 = css`
        position: absolute;
        top: 72px;
        left: 93px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: solid 5px ${color};

        transform: rotate(210deg);
    `;
}

const Index: React.FC = () => {
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div css={Logo1.css0} />
            <div css={Logo1.css1} />
            <div css={Logo1.css2} />
            <div css={Logo1.css3} />
        </Layout>
    );
};

export default Index;
