import { RGBColor } from 'react-color';

export const rgba = (rgba: RGBColor) => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a ?? 1})`;
};
