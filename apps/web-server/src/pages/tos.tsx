import { Typography } from 'antd';
import React from 'react';

/**
 * `tos.md` の内容を用い、利用規約を表示します。
 *
 * ただし、サーバーを運用する際は、このコードを改変して利用規約を表示させても構いません。
 */
const Tos: React.FC = () => {
    return (
        <Typography style={{ padding: 8 }}>
            <Typography.Title level={1}>Flocon 公式サーバー利用規約</Typography.Title>
            <Typography.Title level={2}>1. 本規約の範囲および変更</Typography.Title>
            <p>
                本規約は、Flocon 公式サーバーに適用されるものとします。Flocon
                のソースコードおよび他の Flocon サーバーには適用されません。
            </p>
            <p>本規約は、ユーザーの個別の同意を要せず、必要に応じて随時変更できるものとします。</p>
            <Typography.Title level={2}>2. 禁止行為</Typography.Title>
            <p>ユーザーは、下記の行為をしてはなりません。</p>
            <ol>
                <li>法律や公序良俗に反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>運営を妨害する、もしくはそのおそれのある行為</li>
                <li>不正アクセス、もしくはそれを試みる行為</li>
                <li>本サービス上での宣伝、広告、勧誘、または営業行為</li>
                <li>面識のない異性との出会いを目的とした行為</li>
                <li>他のユーザーになりすます行為</li>
                <li>その他、当サーバーの運営者が不適切と判断する行為</li>
            </ol>
            <Typography.Title level={2}>3. 免責</Typography.Title>
            <p>
                ユーザーが本サービスを利用することで生じたあらゆる損害について、当サーバーの運営者は一切の責任を負わないものとします。
            </p>
            <Typography.Title level={2}>4. データの修正および削除</Typography.Title>
            <p>
                当サーバーの運営者は、ユーザーの個別の同意を要せず、事前に連絡することなく、当サーバーの全部もしくは一部のデータを修正もしくは削除することができるものとします。
            </p>
            <Typography.Title level={2}>5. 運用の停止等</Typography.Title>
            <p>
                当サーバーの運営者は、ユーザーの個別の同意を要せず、事前に連絡することなく、当サーバーを一時的もしくは恒久的に停止できるものとします。
            </p>
        </Typography>
    );
};

export default Tos;
