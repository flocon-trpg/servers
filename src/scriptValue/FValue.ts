import { FArray } from './FArray';
import { FBoolean } from './FBoolean';
import { FFunction } from './FFunction';
import { FNumber } from './FNumber';
import { FObject } from './FObject';
import { FString } from './FString';

export type FValue = null | undefined | FBoolean | FNumber | FString | FArray | FObject | FFunction;
