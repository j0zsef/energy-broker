import './container.scss';
import React from 'react';
import { Container as ReactBootstrapContainer } from 'react-bootstrap';

export type ContainerProps = {
  children: React.ReactNode
  border?: boolean
  fluid?: boolean
};

export const Container: React.FC<ContainerProps> = ({ border, children, fluid }) => {
  const borderStyle = border ? { border: '2px solid #ccc', borderRadius: '0.5rem' } : {};

  return (
    <ReactBootstrapContainer className="custom-container" fluid={fluid} style={borderStyle}>
      {children}
    </ReactBootstrapContainer>
  );
};
