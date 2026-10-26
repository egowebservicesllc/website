import React, { useEffect } from 'react';

export const MailerLiteFooterForm: React.FC = () => {
  useEffect(() => {
    // 1. Define Success Callback
    (window as any).ml_webform_success_42025151 = function() {
      const successRow = document.querySelector('.ml-subscribe-form-42025151 .row-success') as HTMLElement;
      if (successRow) {
        successRow.style.setProperty('display', 'block', 'important');
      }
      const formRow = document.querySelector('.ml-subscribe-form-42025151 .row-form') as HTMLElement;
      if (formRow) {
        formRow.style.setProperty('display', 'none', 'important');
      }

      try {
        const $ = (window as any).ml_jQuery || (window as any).jQuery;
        if ($) {
          $('.ml-subscribe-form-42025151 .row-success').show();
          $('.ml-subscribe-form-42025151 .row-form').hide();
        }
      } catch (e) {
        console.warn('MailerLite jQuery fallback handled:', e);
      }
    };

    const tryRenderRecaptcha = () => {
      try {
        const grecaptcha = (window as any).grecaptcha;
        if (grecaptcha && typeof grecaptcha.render === 'function') {
          const container = document.getElementById('footer-recaptcha');
          if (container && container.innerHTML.trim() === '') {
            try {
              grecaptcha.render(container, {
                sitekey: '6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD'
              });
            } catch (renderErr) {}
          }
        }
      } catch (err) {}
    };

    const tryBindWebform = () => {
      try {
        const $ = (window as any).ml_jQuery || (window as any).jQuery;
        if ($ && typeof $.fn.webform === 'function') {
          $('.ml-subscribe-form-42025151 .ml-block-form').webform();
        }
      } catch (err) {}
    };

    const executeInit = () => {
      tryRenderRecaptcha();
      tryBindWebform();
    };

    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(executeInit, 200);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(executeInit, 100);
    }

    if (!document.getElementById('mailerlite-embed-script')) {
      const script = document.createElement('script');
      script.id = 'mailerlite-embed-script';
      script.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        setTimeout(executeInit, 200);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(executeInit, 100);
    }

    const interval = setInterval(executeInit, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    fetch('https://assets.mailerlite.com/jsonp/1114993/forms/189060311947413287/takel')
      .catch(() => {});

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full">
      <style>{`
        #mlb2-42025151.ml-form-embedContainer {
          background-color: transparent !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          display: block !important;
        }
        #mlb2-42025151 .ml-form-embedWrapper {
          background-color: transparent !important;
          border: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          display: block !important;
        }
        #mlb2-42025151 .ml-form-embedBody {
          padding: 0 !important;
        }
        #mlb2-42025151 .ml-form-embedContent h4 {
          color: #0f172a !important;
          font-family: inherit !important;
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          margin: 0 0 8px 0 !important;
        }
        #mlb2-42025151 .ml-form-embedContent p {
          color: #475569 !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
          margin: 0 0 16px 0 !important;
        }
        #mlb2-42025151 .ml-form-formContent {
          margin: 0 0 16px 0 !important;
        }
        #mlb2-42025151 .ml-form-fieldRow {
          margin-bottom: 12px !important;
        }
        #mlb2-42025151 .ml-field-group label {
          color: #475569 !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          margin-bottom: 6px !important;
          display: block !important;
        }
        #mlb2-42025151 input.form-control {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          width: 100% !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          box-sizing: border-box !important;
        }
        #mlb2-42025151 input.form-control:focus {
          border-color: #0060cc !important;
          box-shadow: 0 0 0 3px rgba(0, 96, 204, 0.15) !important;
          outline: none !important;
        }
        #mlb2-42025151 .ml-form-recaptcha {
          margin-bottom: 16px !important;
          float: none !important;
          width: 100% !important;
          display: flex !important;
          justify-content: flex-start !important;
        }
        #mlb2-42025151 .ml-form-embedSubmit button.primary {
          background-color: hsl(var(--primary)) !important;
          color: #ffffff !important;
          font-family: inherit !important;
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 10px 20px !important;
          width: 100% !important;
          cursor: pointer !important;
          transition: opacity 0.2s ease !important;
          box-sizing: border-box !important;
        }
        #mlb2-42025151 .ml-form-embedSubmit button.primary:hover {
          opacity: 0.9 !important;
        }
        #mlb2-42025151 .ml-form-successBody {
          background-color: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
          border-radius: 8px !important;
          padding: 20px !important;
          text-align: center !important;
        }
        #mlb2-42025151 .ml-form-successContent h4 {
          color: #15803d !important;
          font-family: inherit !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          margin-bottom: 4px !important;
        }
        #mlb2-42025151 .ml-form-successContent p {
          color: #166534 !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          margin: 0 !important;
        }
      `}</style>

      <div id="mlb2-42025151" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-42025151">
        <div className="ml-form-align-center">
          <div className="ml-form-embedWrapper embedForm">
            <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
              <div className="ml-form-embedContent">
                <h4>Get occasional updates</h4>
                <p>
                  Subscribe to our newsletter for insights on web development and IT infrastructure.
                </p>
              </div>

              <form
                className="ml-block-form"
                action="https://assets.mailerlite.com/jsonp/1114993/forms/189060311947413287/subscribe"
                data-code=""
                method="post"
                target="_blank"
              >
                <div className="ml-form-formContent">
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                      <label>Email</label>
                      <input
                        aria-label="email"
                        aria-required="true"
                        type="email"
                        className="form-control"
                        data-inputmask=""
                        name="fields[email]"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <div className="ml-form-fieldRow ml-last-item">
                    <div className="ml-field-group ml-field-name">
                      <label>Name</label>
                      <input
                        aria-label="name"
                        type="text"
                        className="form-control"
                        data-inputmask=""
                        name="fields[name]"
                        placeholder="John Doe"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-form-recaptcha ml-validate-required">
                  <div
                    id="footer-recaptcha"
                    className="g-recaptcha"
                    data-sitekey="6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"
                  ></div>
                </div>

                <input type="hidden" name="ml-submit" value="1" />

                <div className="ml-form-embedSubmit">
                  <button type="submit" className="primary">
                    Subscribe
                  </button>
                  <button
                    disabled={true}
                    style={{ display: 'none' }}
                    type="button"
                    className="loading"
                  >
                    <div className="ml-form-embedSubmitLoad"></div>
                    <span className="sr-only">Loading...</span>
                  </button>
                </div>

                <input type="hidden" name="anticsrf" value="true" />
              </form>
            </div>

            <div className="ml-form-successBody row-success" style={{ display: 'none' }}>
              <div className="ml-form-successContent">
                <h4>You're subscribed!</h4>
                <p>Thanks for joining our newsletter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
