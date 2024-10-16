import { RgbColor } from '@hello-pangea/color-picker';

export const rgba = (rgba: RgbColor) => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a ?? 1})`;
};
