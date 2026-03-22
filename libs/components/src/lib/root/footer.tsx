import './footer.scss';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer text-center">
      <small>
        {'© '}
        {year}
        {' Energy Broker. All rights reserved. | Energy data is provided for informational purposes only and does not constitute financial or legal advice.'}
      </small>
    </footer>
  );
};
