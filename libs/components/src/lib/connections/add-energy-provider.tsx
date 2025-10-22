import { Alert, Button, Form } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { Spinner } from '../shared/spinner';
import { useAuthStore } from '@energy-broker/stores';
import { useEnergyProviders } from '@energy-broker/api-client';

const buildAuthUri = (baseUri: string, clientId: string, redirectUri: string) => {
  const url = new URL(baseUri);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  return url.toString();
};

export const AddEnergyProvider = () => {
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

  const energyType = useStore(form.store, state => state.values.energyType);
  const provider = useStore(form.store, state => state.values.provider);
  const zipCode = useStore(form.store, state => state.values.zipCode);

  // Derive filtered providers from query and form state
  const filteredProviders = useMemo(() => {
    if (!energyProviders || !energyType || zipCode.length !== 5) return [];
    return energyProviders.filter(
      p => p.type === energyType && p.zips.includes(zipCode),
    );
  }, [energyProviders, energyType, zipCode]);

  // Derive selectedProvider inline
  const selectedProvider = useMemo(() => {
    if (filteredProviders.length && provider) {
      return filteredProviders.find(p => p.id === Number(provider));
    }
    return null;
  }, [filteredProviders, provider]);

  // Fetch OAuth config for selected provider
  // Should not fetch if the provider is not selected
  const oauthConfig = selectedProvider?.oAuthProviderConfig;

  // Redirect when config is loaded and pendingRedirect is true
  useEffect(() => {
    if (pendingRedirect && oauthConfig && selectedProvider) {
      useAuthStore.getState().setAuthTokenUrl(oauthConfig.tokenUrl);
      useAuthStore.getState().setClientId(oauthConfig.clientId);
      useAuthStore.getState().setProviderId(selectedProvider.id);
      window.location.href = buildAuthUri(oauthConfig.authUrl, oauthConfig.clientId, oauthConfig.redirectUri);
    }
  }, [pendingRedirect, oauthConfig, selectedProvider]);

  return (
    <>
      <Form className="d-flex flex-column gap-3 col-md-6">
        {/* Loading State */}
        {loadingProviders && (
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-muted">Loading providers...</span>
          </div>
        )}
        {providersError && (
          <Alert variant="danger" className="d-flex align-items-center">
            <span className="me-2 bi bi-exclamation-triangle-fill" aria-hidden="true"></span>
            <span>
              <strong>Failed to load providers.</strong>
              <br />
              {providersError.message || 'Please try again later.'}
            </span>
          </Alert>
        )}
        {/* Energy Type Dropdown */}
        { !loadingProviders && (
          <form.Field
            name="energyType"
            validators={{
              onChange: ({ value }) => !value ? 'Please select an energy type' : undefined,
            }}
            listeners={{
              onChange: () => {
                form.setFieldValue('zipCode', '');
                form.setFieldValue('provider', '');
              },
            }}
          >
            {field => (
              <Form.Group>
                <Form.Label htmlFor="energyType" className="form-label">
                  Energy Type
                  {' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                { /* TODO: need to make an entity for Energy Types */ }
                <Form.Select
                  id="energyType"
                  className={`form-select ${field.state.meta.errors.length ? 'is-invalid' : ''}`}
                  onChange={e => field.handleChange(e.target.value)}
                  value={field.state.value}
                >
                  <option value="">Select energy type...</option>
                  <option value="electrical">Electrical</option>
                  <option value="gas">Natural Gas</option>
                  <option value="solar">Solar</option>
                  <option value="water">Water</option>
                </Form.Select>
                {field.state.meta.errors.length > 0 && (
                  <Form.Control.Feedback type="invalid">
                    {field.state.meta.errors.join(', ')}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}
          </form.Field>
        )}

        {/* Zip Code Input - Shows when energy type is selected */}
        {energyType && (
          <form.Field
            name="zipCode"
            listeners={{
              onChange: ({ value }) => {
                if (value.length === 5) {
                  form.setFieldValue('provider', '');
                }
              },
            }}
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
        {filteredProviders.length > 0 && (
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

        {/* No Providers Found */}
        {filteredProviders.length === 0 && zipCode.length === 5 && energyType && (
          <Alert>
            <span>
              <strong>No providers found</strong>
              {` for ${energyType} in ${zipCode}.`}
              <br />
              <a href="#" className="alert-link">Contact us </a>
              to add support for your area.
            </span>
          </Alert>
        )}

        { /* TODO: add a consent checkbox to consent to 3rd party sharing of info and all that legalese */}

        {/* Submit Button */}
        <form.Subscribe
          selector={state => [state.canSubmit, state.isSubmitting, state.values.provider]}
        >
          {([canSubmit, isSubmitting, provider]) => (
            <div className="d-grid gap-2">
              <Button
                disabled={!canSubmit || !provider || pendingRedirect}
                onClick={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                type="submit"
                variant="primary"
              >
                {(isSubmitting)
                  ? (
                      <Spinner />
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
    </>
  );
};
