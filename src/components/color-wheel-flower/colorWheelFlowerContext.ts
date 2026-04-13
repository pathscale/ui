import { type Accessor, createContext, useContext } from "solid-js";
import type { ColorValue, ColorFormat } from "./ColorUtils";

export interface ColorPickerContextType {
    color: Accessor<ColorValue>;
    format: Accessor<ColorFormat>;
    disabled: Accessor<boolean>;
    onChange: (color: ColorValue) => void;
    onFormatChange: (format: ColorFormat) => void;
}

export const ColorPickerContext = createContext<
    ColorPickerContextType | undefined
>(undefined);

export function useColorPickerContext(): ColorPickerContextType {
    const context = useContext(ColorPickerContext);
    if (!context) {
        throw new Error(
            "useColorPickerContext must be used within a ColorPickerContext.Provider",
        );
    }
    return context;
}
