import { RGBColor } from 'react-color';

export const rgb = (rgb: RGBColor) => {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
