import { atom } from 'jotai';
import { StorybookAtomValueType } from './types';

// isStorybookをtrueにすると、Storybook対応モードとなる。Storybook以外では必ずfalseのままにすること。
export const storybookAtom = atom<StorybookAtomValueType>({ isStorybook: false });
