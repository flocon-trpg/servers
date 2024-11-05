import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import {
    fetchPrivacyPolicyAtom,
    privacyPolicyFileName,
} from '@/atoms/fetchPrivacyPolicyAtom/fetchPrivacyPolicyAtom';
import { TextPage } from '@/components/pages/TextPage/TextPage';

const Component: React.FC = () => {
    const text = useAtomValue(fetchPrivacyPolicyAtom);
    return <TextPage text={text} filename={privacyPolicyFileName} />;
};

export const Route = createFileRoute('/text/privacy_policy')({
    component: Component,
});
