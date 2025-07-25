import React from "react";
import { StyledLinkButton } from "./styled-components";

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const LinkButton: React.FC<LinkButtonProps> = (props) => {
  return <StyledLinkButton {...props} />;
};