import { Alert, Button, Col, Form, Row } from 'react-bootstrap';

import React, { useState } from 'react';
import { useAuthStore } from '@stores';
import { useForm } from '@tanstack/react-form';
import { useOAuthProvider } from '@energy-broker/api-client';

type Provider = {
  id: string
  name: string
  fullName: string
};

type ZipProviders = {
  [zip: string]: Provider[]
};

type MockProviders = {
  electrical: ZipProviders
  gas: ZipProviders
};

const buildAuthUri = (baseUri: string, clientId: string, redirectUri: string) => {
  const url = new URL(baseUri);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
};

export const AddEnergySource = () => {
  let initialProviders: Provider[] = [];
  const [providers, setProviders] = useState(initialProviders);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Mock provider data - replace with your API call
  const mockProviders: MockProviders = {
    electrical: {
      10001: [
        { fullName: 'Consolidated Edison', id: 'coned', name: 'ConEd' },
        { fullName: 'Public Service Enterprise Group', id: 'pseg', name: 'PSEG' },
      ],
      60657: [
        { fullName: 'Commerical Edison', id: 'comed', name: 'ComEd' },
        { fullName: 'Ameren Illinois', id: 'ameren', name: 'Ameren' },
        { fullName: 'Mock Utility', id: 'mock-util', name: 'Mock Utility' },
      ],
      90210: [
        { fullName: 'Southern California Edison', id: 'sce', name: 'SCE' },
        { fullName: 'Los Angeles Department of Water and Power', id: 'ladwp', name: 'LADWP' },
      ],
    },
    gas: {
      10001: [
        { fullName: 'Consolidated Edison - Gas', id: 'coned-gas', name: 'ConEd Gas' },
        { fullName: 'National Grid USA', id: 'national-grid', name: 'National Grid' },
      ],
      60657: [
        { fullName: 'Peoples Gas', id: 'peoples-gas', name: 'Peoples Gas' },
        { fullName: 'North Shore Gas', id: 'north-shore-gas', name: 'North Shore Gas' },
      ],
      90210: [
        { fullName: 'Southern California Gas Company', id: 'socal-gas', name: 'SoCalGas' },
      ],
    },
  };

  const oAuthMutation = useOAuthProvider();

  const form = useForm({
    defaultValues: {
      energyType: '',
      provider: '',
      zipCode: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const { authUrl, clientId, redirectUri, tokenUrl } = await oAuthMutation.mutateAsync({ provider: value.provider });

        useAuthStore.getState().setAuthTokenUrl(tokenUrl);
        useAuthStore.getState().setAuthTokenUrl(tokenUrl);
        useAuthStore.getState().setProvider(value.provider);

        window.location.href = buildAuthUri(authUrl, clientId, redirectUri);
      }
      catch (error) {
        console.error('OAuth error:', error);
      }
    },
  });

  const fetchProviders = async (energyType: string, zipCode: string) => {
    if (!energyType || !zipCode || zipCode.length !== 5) return;

    setLoadingProviders(true);

    // Simulate API call
    setTimeout(() => {
      const typeProviders = mockProviders[energyType as keyof typeof mockProviders];
      const zipProviders = typeProviders?.[zipCode] || [];
      setProviders(zipProviders);
      setLoadingProviders(false);
    }, 500);
  };

  return (
    <Row>
      <Col className="col-md-6">
        <h2>Add Energy Sources</h2>
        <Form className="d-flex flex-column gap-3">
          {/* Energy Type Dropdown */}
          <form.Field
            name="energyType"
            validators={{
              onChange: ({ value }) => !value ? 'Please select an energy type' : undefined,
            }}
          >
            {field => (
              <Form.Group>
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
                  <Form.Control.Feedback type="invalid">
                    {field.state.meta.errors.join(', ')}
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
                <Form.Group>
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
                    <Form.Control.Feedback type="invalid">
                      {field.state.meta.errors.join(', ')}
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
                <Form.Group>
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
                    <Form.Control.Feedback type="invalid">
                      {field.state.meta.errors.join(', ')}
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
            <div>
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
              <span>
                <strong>No providers found</strong>
                {` for ${form.state.values.energyType} in ${form.state.values.zipCode}.`}
                <br />
                <a href="#" className="alert-link">Contact us </a>
                to add support for your area.
              </span>
            </Alert>
          )}

          {/* Submit Button */}
          <form.Subscribe
            selector={state => [state.canSubmit, state.isSubmitting, state.values.provider]}
          >
            {([canSubmit, isSubmitting, provider]) => (
              <div className="d-grid gap-2">
                <Button
                  disabled={!canSubmit || !provider}
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  type="submit"
                  variant="primary"
                >
                  {isSubmitting
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
                <Button variant="secondary">
                  Cancel
                </Button>
              </div>
            )}
          </form.Subscribe>
        </Form>
      </Col>
    </Row>
  );
};
