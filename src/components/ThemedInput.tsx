/** @jsxImportSource @emotion/react */
import React, {useCallback, useContext} from 'react';
import '../assets/ThemedInput.css';
import {ColorScheme, THEME, ThemeContext} from '../ColorScheme';
import {ComponentThemeImplementations} from '../utils';
import {CSSInterpolation} from '@emotion/serialize';

export interface ThemedInputProps {
  isDisabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  value: string;
  onChange: (newValue: string) => void;
}

export interface ThemedInputTheme {
  inputStyle: CSSInterpolation;
}
const themedInputThemeImplementations = new ComponentThemeImplementations<ThemedInputTheme>();
const tiThemedInputTheme = {
  inputStyle: {
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25) ',
    backgroundColor: ColorScheme.getColor('bg0', THEME.TI),
    borderTop: `1px solid transparent`,
    outline: 'none',
    '&:focus': {
      borderTop: `1px solid ${ColorScheme.getColor('red', THEME.TI)}`,
    },
    borderRadius: 0,
    color: ColorScheme.getColor('gray', THEME.TI),
    fontWeight: 600,
    '&:disabled': {
      color: ColorScheme.getColor('grayLight', THEME.TI),
    },
  },
};
themedInputThemeImplementations.set(THEME.TI, tiThemedInputTheme);
const gruvboxThemedInputTheme = {
  inputStyle: {
    backgroundColor: ColorScheme.getColor('bg1', THEME.GRUVBOX),
    color: ColorScheme.getColor('white', THEME.GRUVBOX),
    borderTop: `1px solid transparent`,
    outline: 'none',
    '&:focus': {
      borderTop: `1px solid ${ColorScheme.getColor('fg0', THEME.GRUVBOX)}`,
    },
    '&:disabled': {
      // borderTop: `1px solid ${ColorScheme.getColor("red", THEME.GRUVBOX)}`,
      color: ColorScheme.getColor('gray', THEME.GRUVBOX),
    },
  },
};
themedInputThemeImplementations.set(THEME.GRUVBOX, gruvboxThemedInputTheme);

export function ThemedInput(props: ThemedInputProps) {
  const theme = useContext(ThemeContext);
  let {inputStyle} = themedInputThemeImplementations.get(theme);
  const {onChange} = props;
  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );
  const isDisabled = props.isDisabled || false;
  const propsStyle = props.style || {};
  return (
    <input
      disabled={isDisabled}
      className={'themed_input '.concat(props.className || '')}
      type="text"
      css={inputStyle}
      style={propsStyle}
      spellCheck="false"
      value={props.value}
      onChange={onChangeHandler}
    />
  );
}
