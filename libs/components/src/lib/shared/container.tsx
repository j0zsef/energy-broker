import './container.scss';
import { Container as ReactBootstrapContainer } from 'react-bootstrap';
import { ReactNode } from 'react';

export type ContainerProps = {
  border?: boolean
  children: ReactNode
  fluid?: boolean
};

export const Container = ({ border, children, fluid }: ContainerProps) => {
  const className = border ? 'custom-container custom-container--bordered' : 'custom-container';

  return (
    <ReactBootstrapContainer className={className} fluid={fluid}>
      {children}
    </ReactBootstrapContainer>
  );
};
