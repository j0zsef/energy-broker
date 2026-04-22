import './add-energy-provider.scss';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { apiClient, useEnergyProviders } from '@energy-broker/api-client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Spinner } from '../shared/spinner';

const STEP_COUNT = 3;

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

  // Redirect when pendingRedirect is true and provider is selected
  useEffect(() => {
    if (pendingRedirect && selectedProvider) {
      apiClient<{ url: string }>('v1/energy-providers/authorize', {
        body: JSON.stringify({ energyProviderId: selectedProvider.id }),
        method: 'POST',
      })
        .then((data) => {
          window.location.href = data.url;
        })
        .catch((error) => {
          console.error('Failed to initiate provider OAuth:', error);
          setPendingRedirect(false);
        });
    }
  }, [pendingRedirect, selectedProvider]);

  // Progress: which step the user is on
  const currentStep = !energyType ? 1 : zipCode.length !== 5 ? 2 : 3;

  return (
    <div className="add-provider">
      <Card className="add-provider__card">
        <Card.Body className="add-provider__body">
          <div className="add-provider__icon-ring">🔌</div>
          <h3 className="add-provider__heading">Add Energy Source</h3>
          <p className="add-provider__subheading">
            Connect your utility account to start tracking usage and costs.
          </p>

          {/* Progress indicator */}
          <div className="add-provider__progress">
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <div
                className={`add-provider__progress-step${i + 1 <= currentStep ? ' add-provider__progress-step--active' : ''}${i + 1 < currentStep ? ' add-provider__progress-step--done' : ''}`}
                key={i}
              >
                <span className="add-provider__progress-dot">{i + 1 < currentStep ? '✓' : i + 1}</span>
                <span className="add-provider__progress-label">
                  {['Energy type', 'Location', 'Provider'][i]}
                </span>
              </div>
            ))}
            <div
              className="add-provider__progress-bar"
              style={{ width: `${((currentStep - 1) / (STEP_COUNT - 1)) * 100}%` }}
            />
          </div>

          <Form className="add-provider__form">
            {/* Loading State */}
            {loadingProviders && (
              <div className="d-flex align-items-center justify-content-center py-3">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Loading providers...</span>
              </div>
            )}
            {providersError && (
              <Alert className="d-flex align-items-center" variant="danger">
                <span>
                  <strong>Failed to load providers.</strong>
                  <br />
                  {providersError.message || 'Please try again later.'}
                </span>
              </Alert>
            )}

            {/* Step 1: Energy Type */}
            {!loadingProviders && (
              <form.Field
                listeners={{
                  onChange: () => {
                    form.setFieldValue('zipCode', '');
                    form.setFieldValue('provider', '');
                  },
                }}
                name="energyType"
                validators={{
                  onChange: ({ value }) => !value ? 'Please select an energy type' : undefined,
                }}
              >
                {field => (
                  <Form.Group className="add-provider__field">
                    <Form.Label className="add-provider__label" htmlFor="energyType">
                      Energy Type
                    </Form.Label>
                    <Form.Select
                      className={field.state.meta.errors.length ? 'is-invalid' : ''}
                      id="energyType"
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

            {/* Step 2: Zip Code */}
            {energyType && (
              <form.Field
                listeners={{
                  onChange: ({ value }) => {
                    if (value.length === 5) {
                      form.setFieldValue('provider', '');
                    }
                  },
                }}
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
                  <Form.Group className="add-provider__field">
                    <Form.Label className="add-provider__label" htmlFor="zipCode">
                      Zip Code
                    </Form.Label>
                    <Form.Control
                      className={field.state.meta.errors.length ? 'is-invalid' : ''}
                      id="zipCode"
                      maxLength={5}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        field.handleChange(value);
                      }}
                      placeholder="Enter your 5-digit zip code"
                      type="text"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Form.Control.Feedback type="invalid">
                        {field.state.meta.errors.join(', ')}
                      </Form.Control.Feedback>
                    )}
                    <div className="form-text">
                      {'We\'ll find available providers in your area'}
                    </div>
                  </Form.Group>
                )}
              </form.Field>
            )}

            {/* Step 3: Provider Selection */}
            {filteredProviders.length > 0 && (
              <form.Field
                name="provider"
                validators={{
                  onChange: ({ value }) => !value ? 'Please select a provider' : undefined,
                }}
              >
                {field => (
                  <Form.Group className="add-provider__field">
                    <Form.Label className="add-provider__label" htmlFor="provider">
                      Provider
                    </Form.Label>
                    <Form.Select
                      className={field.state.meta.errors.length ? 'is-invalid' : ''}
                      id="provider"
                      onChange={e => field.handleChange(e.target.value)}
                      value={field.state.value}
                    >
                      <option value="">Select your provider...</option>
                      {filteredProviders.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </Form.Select>
                    {field.state.meta.errors.length > 0 && (
                      <Form.Control.Feedback type="invalid">
                        {field.state.meta.errors.join(', ')}
                      </Form.Control.Feedback>
                    )}
                    <div className="form-text">
                      {'Don\'t see your provider? '}
                      <a className="text-decoration-none" href="#">Let us know</a>
                    </div>
                  </Form.Group>
                )}
              </form.Field>
            )}

            {/* No Providers Found */}
            {filteredProviders.length === 0 && zipCode.length === 5 && energyType && (
              <Alert variant="warning">
                <strong>No providers found</strong>
                {` for ${energyType} in ${zipCode}.`}
                <br />
                <a className="alert-link" href="#">Contact us</a>
                {' to add support for your area.'}
              </Alert>
            )}

            {/* Actions */}
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting, state.values.provider]}
            >
              {([canSubmit, isSubmitting, providerVal]) => (
                <div className="add-provider__actions">
                  <Button
                    className="add-provider__cta"
                    disabled={!canSubmit || !providerVal || pendingRedirect}
                    onClick={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                    type="submit"
                    variant="primary"
                  >
                    {isSubmitting ? <Spinner /> : 'Connect to Provider'}
                  </Button>
                  <Link to="/connections">
                    <Button className="w-100" variant="outline-secondary">Cancel</Button>
                  </Link>
                </div>
              )}
            </form.Subscribe>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
