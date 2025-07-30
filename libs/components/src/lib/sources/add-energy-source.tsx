import { Alert, Button, Col, Form, Row } from 'react-bootstrap';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';

export const AddEnergySource = () => {
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Mock provider data - replace with your API call
  const mockProviders = {
    electrical: {
      10001: [
        { id: 'coned', name: 'ConEd', fullName: 'Consolidated Edison' },
        { id: 'pseg', name: 'PSEG', fullName: 'Public Service Enterprise Group' },
      ],
      90210: [
        { id: 'sce', name: 'SCE', fullName: 'Southern California Edison' },
        { id: 'ladwp', name: 'LADWP', fullName: 'Los Angeles Department of Water and Power' },
      ],
    },
    gas: {
      10001: [
        { id: 'coned-gas', name: 'ConEd Gas', fullName: 'Consolidated Edison - Gas' },
        { id: 'national-grid', name: 'National Grid', fullName: 'National Grid USA' },
      ],
      90210: [
        { id: 'socal-gas', name: 'SoCalGas', fullName: 'Southern California Gas Company' },
      ],
    },
  };

  const form = useForm({
    defaultValues: {
      energyType: '',
      zipCode: '',
      provider: '',
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value);
      // Here you would trigger OAuth flow
      alert(`Starting OAuth flow for ${value.provider} (${value.energyType})`);
    },
  });

  const fetchProviders = async (energyType, zipCode) => {
    if (!energyType || !zipCode || zipCode.length !== 5) return;

    setLoadingProviders(true);

    // Simulate API call
    setTimeout(() => {
      const typeProviders = mockProviders[energyType];
      const zipProviders = typeProviders?.[zipCode] || [];
      setProviders(zipProviders);
      setLoadingProviders(false);
    }, 500);
  };

  return (
    <Row className="mb-3">
      <Col className="col-md-6">
        <h2>Add Energy Sources</h2>
        <Form>
          {/* Energy Type Dropdown */}
          <form.Field
            name="energyType"
            validators={{
              onChange: ({ value }) => !value ? 'Please select an energy type' : undefined,
            }}
          >
            {field => (
              <Form.Group className="mb-3">
                <Form.Label htmlFor="energyType" className="form-label">
                  Energy Type
                  {' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  id="energyType"
                  className={`form-select ${field.state.meta.errors.length ? 'is-invalid' : ''}`}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    // Reset dependent fields
                    form.setFieldValue('zipCode', '');
                    form.setFieldValue('provider', '');
                    setProviders([]);
                  }}
                >
                  <option value="">Select energy type...</option>
                  <option value="electrical">Electrical</option>
                  <option value="gas">Natural Gas</option>
                  <option value="solar">Solar</option>
                </Form.Select>
                {field.state.meta.errors.length > 0 && (
                  <Form.Control.Feedback>
                    {field.state.meta.errors[0]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}
          </form.Field>

          {/* Zip Code Input - Shows when energy type is selected */}
          {form.state.values.energyType && (
            <form.Field
              name="zipCode"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Please enter your zip code';
                  if (!/^\d{5}$/.test(value)) return 'Please enter a valid 5-digit zip code';
                  return undefined;
                },
              }}
            >
              {field => (
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="zipCode" className="form-label">
                    Zip Code
                    {' '}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    id="zipCode"
                    type="text"
                    className={`form-control ${field.state.meta.errors.length ? 'is-invalid' : ''}`}
                    placeholder="Enter your 5-digit zip code"
                    value={field.state.value}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      field.handleChange(value);

                      // Fetch providers when we have valid zip
                      if (value.length === 5) {
                        fetchProviders(form.state.values.energyType, value);
                        form.setFieldValue('provider', ''); // Reset provider selection
                      }
                      else {
                        setProviders([]);
                      }
                    }}
                    maxLength={5}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Form.Control.Feedback>
                      {field.state.meta.errors[0]}
                    </Form.Control.Feedback>
                  )}
                  <div className="form-text">
                    We will find available providers in your area
                  </div>
                </Form.Group>
              )}
            </form.Field>
          )}

          {/* Provider Selection - Shows when providers are loaded */}
          {providers.length > 0 && (
            <form.Field
              name="provider"
              validators={{
                onChange: ({ value }) => !value ? 'Please select a provider' : undefined,
              }}
            >
              {field => (
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="provider" className="form-label">
                    Provider
                    {' '}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    id="provider"
                    className={`form-select ${field.state.meta.errors.length ? 'is-invalid' : ''}`}
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                  >
                    <option value="">Select your provider...</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.fullName}
                      </option>
                    ))}
                  </Form.Select>
                  {field.state.meta.errors.length > 0 && (
                    <Form.Control.Feedback>
                      {field.state.meta.errors[0]}
                    </Form.Control.Feedback>
                  )}
                  <div className="form-text">
                    Do not see your provider?
                    {' '}
                    <a href="#" className="text-decoration-none">Let us know</a>
                  </div>
                </Form.Group>
              )}
            </form.Field>
          )}

          {/* Loading State */}
          {loadingProviders && (
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Finding providers in your area...</span>
              </div>
            </div>
          )}

          {/* No Providers Found */}
          {!loadingProviders && providers.length === 0 && form.state.values.zipCode.length === 5 && form.state.values.energyType && (
            <Alert>
              <strong>No providers found</strong>
              {' '}
              for
              {form.state.values.energyType}
              {' '}
              in
              {form.state.values.zipCode}
              .
              <br />
              <a href="#" className="alert-link">Contact us</a>
              {' '}
              to add support for your area.
            </Alert>
          )}

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <Button
              type="button"
              className="btn btn-primary"
              disabled={!form.state.canSubmit || !form.state.values.provider}
              onClick={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {form.state.isSubmitting
                ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </span>
                      Connecting...
                    </>
                  )
                : (
                    'Connect to Provider'
                  )}
            </Button>
            <Button type="button" className="btn btn-outline-secondary">
              Cancel
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
};
