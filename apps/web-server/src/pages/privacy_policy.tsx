import { Typography } from 'antd';
import React from 'react';

/**
 * `privacy_policy.md` の内容を用い、プライバシーポリシーを表示します。
 *
 * ただし、サーバーを運用する際は、このコードを改変してプライバシーポリシーを表示させても構いません。
 */
const PrivacyPolicy: React.FC = () => {
    return (
        <Typography style={{ padding: 8 }}>
            <Typography.Title level={1}>プライバシーポリシー</Typography.Title>
            <Typography.Title level={2}>1. 当サーバーで保存する情報</Typography.Title>
            <p>
                当サーバーでは、アカウント登録の際にご入力いただいたメールアドレスや Google
                アカウント等の情報を保存します。また、サーバーのログに、IP
                アドレス、情報端末の名前、オペレーティングシステム、実行した API
                (パラメーターも含む)とその日時等を記録し、一時的に保存することがあります。
            </p>
            <Typography.Title level={2}>2. 情報の提供および開示</Typography.Title>
            <p>
                当サーバーは、Firebase および fly.io
                を用いて前項の情報を管理しています。これらのサービスを提供している企業を除く第三者に、前項の情報を提供もしくは開示することはありません。ただし、次の場合は提供もしくは開示に応じる場合がございます。
            </p>
            <ul>
                <li>ご本人の同意がある場合</li>
                <li>司法・行政機関からの要請</li>
            </ul>
        </Typography>
    );
};

export default PrivacyPolicy;
