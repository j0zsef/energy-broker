import './container.scss';
import { Container as ReactBootstrapContainer } from 'react-bootstrap';
import { ReactNode } from 'react';

export type ContainerProps = {
  children: ReactNode
  border?: boolean
  fluid?: boolean
};

export const Container = ({ border, children, fluid }: ContainerProps) => {
  const borderStyle = border ? { border: '2px solid #ccc', borderRadius: '0.5rem' } : {};

  return (
    <ReactBootstrapContainer className="custom-container" fluid={fluid} style={borderStyle}>
      {children}
    </ReactBootstrapContainer>
  );
};
