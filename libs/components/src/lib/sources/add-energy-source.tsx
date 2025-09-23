import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { useEnergyProviders, useOAuthProviderConfig } from '@energy-broker/api-client';

import { useAuthStore } from '@stores';
import { useForm } from '@tanstack/react-form';

const buildAuthUri = (baseUri: string, clientId: string, redirectUri: string) => {
  const url = new URL(baseUri);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
};

export const AddEnergySource = () => {
  const { data: energyProviders, isLoading: loadingProviders, error: providersError } = useEnergyProviders();
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const form = useForm({
    defaultValues: {
      energyType: '',
      provider: '',
      zipCode: '',
    },
    onSubmit: async () => {
      setPendingRedirect(true);
    },
  });

  // Derive filtered providers from query and form state
  const filteredProviders = useMemo(() => {
    if (!energyProviders || !form.state.values.energyType || form.state.values.zipCode.length !== 5) return [];
    return energyProviders.filter(
      p => p.type === form.state.values.energyType && p.zips.includes(form.state.values.zipCode),
    );
  }, [energyProviders, form.state.values.energyType, form.state.values.zipCode]);

  // Derive selectedProvider inline
  const selectedProvider = useMemo(() => {
    if (filteredProviders.length && form.state.values.provider) {
      return filteredProviders.find(p => p.id === Number(form.state.values.provider));
    }
    return null;
  }, [filteredProviders, form.state.values.provider]);

  // Fetch OAuth config for selected provider
  // Should not fetch if the provider is not selected
  const { data: oauthConfig, isLoading: loadingConfig, error: configError } = useOAuthProviderConfig(
    selectedProvider?.oAuthProviderConfigId ?? 0,
  );

  // Redirect when config is loaded and pendingRedirect is true
  useEffect(() => {
    if (pendingRedirect && oauthConfig && selectedProvider) {
      useAuthStore.getState().setAuthTokenUrl(oauthConfig.tokenUrl);
      useAuthStore.getState().setProvider(selectedProvider.name);
      window.location.href = buildAuthUri(oauthConfig.authUrl, oauthConfig.clientId, oauthConfig.redirectUri);
    }
  }, [pendingRedirect, oauthConfig, selectedProvider]);

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
                    form.setFieldValue('zipCode', '');
                    form.setFieldValue('provider', '');
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
                      if (value.length === 5) {
                        form.setFieldValue('provider', '');
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
          {filteredProviders.length > 0 && !providersError && (
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
                    {filteredProviders.map(provider => (
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
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-muted">Finding providers in your area...</span>
            </div>
          )}

          {/* No Providers Found */}
          {!loadingProviders && filteredProviders.length === 0 && form.state.values.zipCode.length === 5 && form.state.values.energyType && (
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
                  disabled={!canSubmit || !provider || pendingRedirect || loadingConfig || !!configError}
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  type="submit"
                  variant="primary"
                >
                  {(isSubmitting || loadingConfig)
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
                <Button variant="secondary">Cancel</Button>
              </div>
            )}
          </form.Subscribe>
        </Form>
      </Col>
    </Row>
  );
};
