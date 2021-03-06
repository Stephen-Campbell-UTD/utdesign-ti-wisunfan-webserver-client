import {useContext} from 'react';
import Select, {StylesConfig} from 'react-select';
import {Color, ColorScheme, THEME, ThemeContext} from '../ColorScheme';
import {ComponentThemeImplementations} from '../utils';
import {LoadingBars} from './LoadingBars';

interface ThemedSelectTheme {
  textColor: Color;
  accentColor: Color;
  backgroundColor: Color;
  optionSelectedBackgroundColor: Color;
  controlStyle: React.CSSProperties;
}
const themedSelectThemeImplementations = new ComponentThemeImplementations<ThemedSelectTheme>();
const tiThemedSelectTheme = {
  accentColor: ColorScheme.getColor('red', THEME.TI),
  textColor: ColorScheme.getColor('gray', THEME.TI),
  backgroundColor: ColorScheme.getColor('bg0', THEME.TI),
  optionSelectedBackgroundColor: ColorScheme.getColor('bg2', THEME.TI),
  controlStyle: {
    // borderTop: `1px solid ${ColorScheme.getColor("red", THEME.TI)}`,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25) ',
    borderRadius: 0,
    fontWeight: 600,
  },
};
themedSelectThemeImplementations.set(THEME.TI, tiThemedSelectTheme);
const gruvboxThemedSelectTheme = {
  textColor: ColorScheme.getColor('white', THEME.GRUVBOX),
  accentColor: ColorScheme.getColor('fg0', THEME.GRUVBOX),
  backgroundColor: ColorScheme.getColor('bg1', THEME.GRUVBOX),
  optionSelectedBackgroundColor: ColorScheme.getColor('bg2', THEME.GRUVBOX),
  controlStyle: {
    borderRadius: 9,
  },
};
themedSelectThemeImplementations.set(THEME.GRUVBOX, gruvboxThemedSelectTheme);

type OptionType = {
  label: string;
  value: any;
};

interface ThemedSelectProps {
  width?: number | string;
  fontSize?: number | string;
  options: OptionType[];
  value?: OptionType;
  defaultValue?: any;
  defaultInputValue?: any;
  onChange?: (newValue: any) => void;
}

const loadingBarsStyle = {
  position: 'absolute' as 'absolute',
  height: '80%',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 'auto',
  marginBottom: 'auto',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  // zIndex: 10,
};

export function ThemedSelect(props: ThemedSelectProps) {
  const theme = useContext(ThemeContext);
  const width = props.width || '100%';
  let {controlStyle, accentColor, textColor, optionSelectedBackgroundColor, backgroundColor} =
    themedSelectThemeImplementations.get(theme);

  const customStyles: StylesConfig = {
    container: provided => ({...provided, width: '100%'}),
    menu: (provided, state) => ({
      ...provided,
      backgroundColor,
      color: textColor,
      padding: 20,
    }),

    control: (provided, state) => {
      const style = {
        // ...provided,
        display: 'flex' as 'flex',
        flexDirection: 'row' as 'row',
        justifyContent: 'center' as 'center',
        fontSize: props.fontSize,
        alignItems: 'center',
        borderTop: '1px solid transparent',
        height: 30,
        '&:hover': {
          // borderTop: `1px solid ${accentColor}`,
        },
        backgroundColor,
        color: textColor,
        ...controlStyle,
      };
      if (state.isFocused) {
        style['borderTop'] = `1px solid ${accentColor}`;
        style['borderLeft'] = `0px `;
        style['borderRight'] = `0px`;
        style['borderBottom'] = `0px`;
      }
      return style;
    },

    singleValue: provided => {
      return {
        ...provided,
        backgroundColor,
        color: textColor,
        fontSize: props.fontSize,
      };
    },

    option: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = 'opacity 300ms';
      const style = {
        ...provided,
        color: textColor,
        fontSize: props.fontSize,
        opacity,
        transition,
        backgroundColor: state.isSelected ? optionSelectedBackgroundColor : backgroundColor,
        '&:hover': {
          backgroundColor: optionSelectedBackgroundColor,
        },
      };
      if (state.isSelected) {
        style['borderLeft'] = `1px solid ${accentColor}`;
      }

      return style;
    },
  };
  const isLoading = props.value === null;
  return (
    <div style={{position: 'relative', width}}>
      {isLoading && <LoadingBars style={loadingBarsStyle} />}
      <Select
        styles={customStyles}
        options={props.options}
        value={props.value}
        isSearchable={false}
        onChange={props.onChange}
        defaultInputValue={props.defaultInputValue}
        defaultValue={props.defaultValue}
      />
    </div>
  );
}
