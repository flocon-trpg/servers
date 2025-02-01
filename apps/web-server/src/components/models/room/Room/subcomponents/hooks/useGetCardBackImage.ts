import { getCardBackImage } from '../utils/getCardBackImage';

export const useGetCardBackImage = (...args: Parameters<typeof getCardBackImage>) => {
    return getCardBackImage(...args);
};
