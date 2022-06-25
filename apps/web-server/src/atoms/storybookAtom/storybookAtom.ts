import { atom } from 'jotai';
import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';
import { Result } from '@kizahasi/result';
import { WebConfig } from '../../configType';
import { FirebaseUserState } from '../../utils/firebase/firebaseUserState';

export type StorybookAtomValueType =
    | {
          isStorybook: false;
          mock?: undefined;
      }
    | {
          isStorybook: true;
          mock: {
              auth?: Auth;
              user?: FirebaseUserState;
              storage?: FirebaseStorage;
              webConfig?: Result<WebConfig>;
          };
      };

// isStorybookをtrueにすると、Storybook対応モードとなる。Storybook以外では必ずfalseのままにすること。
export const storybookAtom = atom<StorybookAtomValueType>({ isStorybook: false });
