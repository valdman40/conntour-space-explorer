import React from "react";
import { StyledButton } from "./styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = (props) => {
  return <StyledButton {...props} />;
};