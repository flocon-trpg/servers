import { RgbColor } from '@hello-pangea/color-picker';

export const rgb = (rgb: RgbColor) => {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
