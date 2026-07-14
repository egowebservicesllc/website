import React, { useEffect } from 'react';

export const MailerLiteContactForm: React.FC = () => {
  useEffect(() => {
    // 1. Success Callback for form 42026726
    (window as any).ml_webform_success_42026726 = function() {
      const successRow = document.querySelector('.ml-subscribe-form-42026726 .row-success') as HTMLElement;
      if (successRow) {
        successRow.style.setProperty('display', 'block', 'important');
      }
      const formRow = document.querySelector('.ml-subscribe-form-42026726 .row-form') as HTMLElement;
      if (formRow) {
        formRow.style.setProperty('display', 'none', 'important');
      }

      try {
        const $ = (window as any).ml_jQuery || (window as any).jQuery;
        if ($) {
          $('.ml-subscribe-form-42026726 .row-success').show();
          $('.ml-subscribe-form-42026726 .row-form').hide();
        }
      } catch (e) {}
    };

    const tryRenderRecaptcha = () => {
      try {
        const grecaptcha = (window as any).grecaptcha;
        if (grecaptcha && typeof grecaptcha.render === 'function') {
          const container = document.getElementById('contact-recaptcha');
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
          $('.ml-subscribe-form-42026726 .ml-block-form').webform();
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

    fetch('https://assets.mailerlite.com/jsonp/1114993/forms/189061840884467223/takel')
      .catch(() => {});

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full">
      <style>{`
        #mlb2-42026726.ml-form-embedContainer {
          background-color: transparent !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          display: block !important;
        }
        #mlb2-42026726 .ml-form-embedWrapper {
          background-color: transparent !important;
          border: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          display: block !important;
        }
        #mlb2-42026726 .ml-form-embedBody {
          padding: 0 !important;
        }
        #mlb2-42026726 .ml-form-formContent {
          margin: 0 0 24px 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
        }
        #mlb2-42026726 .ml-form-fieldRow {
          margin: 0 !important;
          width: 100% !important;
        }
        #mlb2-42026726 .ml-field-group {
          margin: 0 !important;
          text-align: left !important;
        }
        #mlb2-42026726 .ml-field-group label {
          color: #0f172a !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          margin-bottom: 8px !important;
          display: block !important;
        }
        #mlb2-42026726 textarea.form-control {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-family: inherit !important;
          font-size: 0.95rem !important;
          width: 100% !important;
          min-height: 120px !important;
          resize: vertical !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          box-sizing: border-box !important;
        }
        #mlb2-42026726 textarea.form-control::placeholder {
          color: #94a3b8 !important;
        }
        #mlb2-42026726 textarea.form-control:focus {
          border-color: #0060cc !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(0, 96, 204, 0.15) !important;
          outline: none !important;
        }
        #mlb2-42026726 input.form-control,
        #mlb2-42026726 select.custom-select {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-family: inherit !important;
          font-size: 0.95rem !important;
          width: 100% !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          box-sizing: border-box !important;
          height: 48px !important;
        }
        #mlb2-42026726 input.form-control::placeholder {
          color: #94a3b8 !important;
        }
        #mlb2-42026726 select.custom-select {
          appearance: none !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 1rem center !important;
          background-repeat: no-repeat !important;
          background-size: 1.5em 1.5em !important;
          padding-right: 2.5rem !important;
          cursor: pointer !important;
        }
        #mlb2-42026726 input.form-control:focus,
        #mlb2-42026726 select.custom-select:focus {
          border-color: #0060cc !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(0, 96, 204, 0.15) !important;
          outline: none !important;
        }
        #mlb2-42026726 .ml-form-recaptcha {
          margin-bottom: 24px !important;
          float: none !important;
          width: 100% !important;
          display: flex !important;
          justify-content: flex-start !important;
        }
        #mlb2-42026726 .ml-form-embedSubmit button.primary {
          background-color: hsl(var(--primary)) !important;
          color: #ffffff !important;
          font-family: inherit !important;
          font-weight: 600 !important;
          font-size: 1.125rem !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 14px 32px !important;
          width: 100% !important;
          height: 56px !important;
          cursor: pointer !important;
          transition: transform 0.2s ease, opacity 0.2s ease !important;
          box-sizing: border-box !important;
        }
        #mlb2-42026726 .ml-form-embedSubmit button.primary:hover {
          opacity: 0.9 !important;
          transform: scale(1.01) !important;
        }
        #mlb2-42026726 .ml-form-successBody {
          background-color: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
          border-radius: 16px !important;
          padding: 40px !important;
          text-align: center !important;
        }
        #mlb2-42026726 .ml-form-successContent h4 {
          color: #16a34a !important;
          font-family: inherit !important;
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          margin-bottom: 12px !important;
        }
        #mlb2-42026726 .ml-form-successContent p {
          color: #15803d !important;
          font-family: inherit !important;
          font-size: 1rem !important;
          margin: 0 !important;
        }
      `}</style>

      <div id="mlb2-42026726" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-42026726">
        <div className="ml-form-align-center">
          <div className="ml-form-embedWrapper embedForm">
            <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
              <form
                className="ml-block-form"
                action="https://assets.mailerlite.com/jsonp/1114993/forms/189061840884467223/subscribe"
                data-code=""
                method="post"
                target="_blank"
              >
                <div className="ml-form-formContent">
                  
                  {/* Full Name */}
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-name ml-validate-required">
                      <label>Full name</label>
                      <input
                        aria-label="name"
                        aria-required="true"
                        type="text"
                        className="form-control"
                        data-inputmask=""
                        name="fields[name]"
                        placeholder="John Doe"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                      <label>Email address</label>
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

                  {/* Company */}
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-company ml-validate-required">
                      <label>Company</label>
                      <input
                        aria-label="company"
                        aria-required="true"
                        type="text"
                        className="form-control"
                        data-inputmask=""
                        name="fields[company]"
                        placeholder="e.g. Acme Corp"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-phone ml-validate-required">
                      <label>Phone number</label>
                      <input
                        aria-label="phone"
                        aria-required="true"
                        type="text"
                        className="form-control"
                        data-inputmask=""
                        name="fields[phone]"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-country ml-validate-required">
                      <label>Country</label>
                      <select className="custom-select" name="fields[country]" aria-label="country" aria-required="true" defaultValue="" required>
                        <option value="">-</option>
                        <option value="Afghanistan">Afghanistan</option>
                        <option value="Albania">Albania</option>
                        <option value="Algeria">Algeria</option>
                        <option value="American Samoa">American Samoa</option>
                        <option value="Andorra">Andorra</option>
                        <option value="Angola">Angola</option>
                        <option value="Anguilla">Anguilla</option>
                        <option value="Antigua & Barbuda">Antigua & Barbuda</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Armenia">Armenia</option>
                        <option value="Aruba">Aruba</option>
                        <option value="Australia">Australia</option>
                        <option value="Austria">Austria</option>
                        <option value="Azerbaijan">Azerbaijan</option>
                        <option value="Bahamas">Bahamas</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Barbados">Barbados</option>
                        <option value="Belarus">Belarus</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Belize">Belize</option>
                        <option value="Benin">Benin</option>
                        <option value="Bermuda">Bermuda</option>
                        <option value="Bhutan">Bhutan</option>
                        <option value="Bolivia">Bolivia</option>
                        <option value="Bonaire">Bonaire</option>
                        <option value="Bosnia & Herzegovina">Bosnia & Herzegovina</option>
                        <option value="Botswana">Botswana</option>
                        <option value="Brazil">Brazil</option>
                        <option value="British Indian Ocean Ter">British Indian Ocean Ter</option>
                        <option value="Brunei">Brunei</option>
                        <option value="Bulgaria">Bulgaria</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Burundi">Burundi</option>
                        <option value="Cambodia">Cambodia</option>
                        <option value="Cameroon">Cameroon</option>
                        <option value="Canada">Canada</option>
                        <option value="Canary Islands">Canary Islands</option>
                        <option value="Cape Verde">Cape Verde</option>
                        <option value="Cayman Islands">Cayman Islands</option>
                        <option value="Central African Republic">Central African Republic</option>
                        <option value="Chad">Chad</option>
                        <option value="Channel Islands">Channel Islands</option>
                        <option value="Chile">Chile</option>
                        <option value="China">China</option>
                        <option value="Christmas Island">Christmas Island</option>
                        <option value="Cocos Island">Cocos Island</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Comoros">Comoros</option>
                        <option value="Congo">Congo</option>
                        <option value="Cook Islands">Cook Islands</option>
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Ivory Coast">Ivory Coast</option>
                        <option value="Croatia">Croatia</option>
                        <option value="Cuba">Cuba</option>
                        <option value="Curacao">Curacao</option>
                        <option value="Cyprus">Cyprus</option>
                        <option value="Czech Republic">Czech Republic</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Djibouti">Djibouti</option>
                        <option value="Dominica">Dominica</option>
                        <option value="Dominican Republic">Dominican Republic</option>
                        <option value="East Timor">East Timor</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Egypt">Egypt</option>
                        <option value="El Salvador">El Salvador</option>
                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                        <option value="Eritrea">Eritrea</option>
                        <option value="Estonia">Estonia</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Falkland Islands">Falkland Islands</option>
                        <option value="Faroe Islands">Faroe Islands</option>
                        <option value="Fiji">Fiji</option>
                        <option value="Finland">Finland</option>
                        <option value="France">France</option>
                        <option value="French Guiana">French Guiana</option>
                        <option value="French Polynesia">French Polynesia</option>
                        <option value="French Southern Ter">French Southern Ter</option>
                        <option value="Gabon">Gabon</option>
                        <option value="Gambia">Gambia</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Germany">Germany</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Gibraltar">Gibraltar</option>
                        <option value="Greece">Greece</option>
                        <option value="Greenland">Greenland</option>
                        <option value="Grenada">Grenada</option>
                        <option value="Guadeloupe">Guadeloupe</option>
                        <option value="Guam">Guam</option>
                        <option value="Guatemala">Guatemala</option>
                        <option value="Guinea">Guinea</option>
                        <option value="Guyana">Guyana</option>
                        <option value="Haiti">Haiti</option>
                        <option value="Hawaii">Hawaii</option>
                        <option value="Honduras">Honduras</option>
                        <option value="Hong Kong">Hong Kong</option>
                        <option value="Hungary">Hungary</option>
                        <option value="Iceland">Iceland</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="India">India</option>
                        <option value="Iran">Iran</option>
                        <option value="Iraq">Iraq</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Isle of Man">Isle of Man</option>
                        <option value="Israel">Israel</option>
                        <option value="Italy">Italy</option>
                        <option value="Jamaica">Jamaica</option>
                        <option value="Japan">Japan</option>
                        <option value="Jordan">Jordan</option>
                        <option value="Kazakhstan">Kazakhstan</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Kiribati">Kiribati</option>
                        <option value="Korea North">Korea North</option>
                        <option value="Korea South">Korea South</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="Kyrgyzstan">Kyrgyzstan</option>
                        <option value="Laos">Laos</option>
                        <option value="Latvia">Latvia</option>
                        <option value="Lebanon">Lebanon</option>
                        <option value="Lesotho">Lesotho</option>
                        <option value="Liberia">Liberia</option>
                        <option value="Libya">Libya</option>
                        <option value="Liechtenstein">Liechtenstein</option>
                        <option value="Lithuania">Lithuania</option>
                        <option value="Luxembourg">Luxembourg</option>
                        <option value="Macau">Macau</option>
                        <option value="Macedonia">Macedonia</option>
                        <option value="Madagascar">Madagascar</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Malawi">Malawi</option>
                        <option value="Maldives">Maldives</option>
                        <option value="Mali">Mali</option>
                        <option value="Malta">Malta</option>
                        <option value="Marshall Islands">Marshall Islands</option>
                        <option value="Martinique">Martinique</option>
                        <option value="Mauritania">Mauritania</option>
                        <option value="Mauritius">Mauritius</option>
                        <option value="Mayotte">Mayotte</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Midway Islands">Midway Islands</option>
                        <option value="Moldova">Moldova</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Mongolia">Mongolia</option>
                        <option value="Montenegro">Montenegro</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Morocco">Morocco</option>
                        <option value="Mozambique">Mozambique</option>
                        <option value="Myanmar">Myanmar</option>
                        <option value="Namibia">Namibia</option>
                        <option value="Nauru">Nauru</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Netherland Antilles">Netherland Antilles</option>
                        <option value="Netherlands">Netherlands (Holland, Europe)</option>
                        <option value="Nevis">Nevis</option>
                        <option value="New Caledonia">New Caledonia</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="Nicaragua">Nicaragua</option>
                        <option value="Niger">Niger</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Niue">Niue</option>
                        <option value="Norfolk Island">Norfolk Island</option>
                        <option value="Norway">Norway</option>
                        <option value="Oman">Oman</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Palau Island">Palau Island</option>
                        <option value="Palestine">Palestine</option>
                        <option value="Panama">Panama</option>
                        <option value="Papua New Guinea">Papua New Guinea</option>
                        <option value="Paraguay">Paraguay</option>
                        <option value="Peru">Peru</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Pitcairn Island">Pitcairn Island</option>
                        <option value="Poland">Poland</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Puerto Rico">Puerto Rico</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Republic of Montenegro">Republic of Montenegro</option>
                        <option value="Republic of Serbia">Republic of Serbia</option>
                        <option value="Reunion">Reunion</option>
                        <option value="Romania">Romania</option>
                        <option value="Russia">Russia</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="St Barthelemy">St Barthelemy</option>
                        <option value="St Eustatius">St Eustatius</option>
                        <option value="St Helena">St Helena</option>
                        <option value="St Kitts-Nevis">St Kitts-Nevis</option>
                        <option value="St Lucia">St Lucia</option>
                        <option value="St Maarten">St Maarten</option>
                        <option value="St Pierre & Miquelon">St Pierre & Miquelon</option>
                        <option value="St Vincent & Grenadines">St Vincent & Grenadines</option>
                        <option value="Saipan">Saipan</option>
                        <option value="Samoa">Samoa</option>
                        <option value="Samoa American">Samoa American</option>
                        <option value="San Marino">San Marino</option>
                        <option value="Sao Tome & Principe">Sao Tome & Principe</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Senegal">Senegal</option>
                        <option value="Seychelles">Seychelles</option>
                        <option value="Sierra Leone">Sierra Leone</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Slovakia">Slovakia</option>
                        <option value="Slovenia">Slovenia</option>
                        <option value="Solomon Islands">Solomon Islands</option>
                        <option value="Somalia">Somalia</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Spain">Spain</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Sudan">Sudan</option>
                        <option value="Suriname">Suriname</option>
                        <option value="Swaziland">Swaziland</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Syria">Syria</option>
                        <option value="Tahiti">Tahiti</option>
                        <option value="Taiwan">Taiwan</option>
                        <option value="Tajikistan">Tajikistan</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Togo">Togo</option>
                        <option value="Tokelau">Tokelau</option>
                        <option value="Tonga">Tonga</option>
                        <option value="Trinidad & Tobago">Trinidad & Tobago</option>
                        <option value="Tunisia">Tunisia</option>
                        <option value="Turkey">Turkey</option>
                        <option value="Turkmenistan">Turkmenistan</option>
                        <option value="Turks & Caicos Is">Turks & Caicos Is</option>
                        <option value="Tuvalu">Tuvalu</option>
                        <option value="Uganda">Uganda</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Ukraine">Ukraine</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United States of America">United States of America</option>
                        <option value="Uruguay">Uruguay</option>
                        <option value="Uzbekistan">Uzbekistan</option>
                        <option value="Vanuatu">Vanuatu</option>
                        <option value="Vatican City State">Vatican City State</option>
                        <option value="Venezuela">Venezuela</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Virgin Islands (Brit)">Virgin Islands (Brit)</option>
                        <option value="Virgin Islands (USA)">Virgin Islands (USA)</option>
                        <option value="Wake Island">Wake Island</option>
                        <option value="Wallis and Futuna Islands">Wallis and Futuna Islands</option>
                        <option value="Yemen">Yemen</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="ml-form-fieldRow ml-last-item">
                    <div className="ml-field-group ml-field-z_i_p ml-validate-required">
                      <label>Message</label>
                      <textarea
                        className="form-control"
                        name="fields[z_i_p]"
                        aria-label="z_i_p"
                        aria-required="true"
                        maxLength={1024}
                        placeholder="More details about your inquiry or project"
                        required
                      ></textarea>
                    </div>
                  </div>

                </div>

                <div className="ml-form-recaptcha ml-validate-required">
                  <div
                    id="contact-recaptcha"
                    className="g-recaptcha"
                    data-sitekey="6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"
                  ></div>
                </div>

                <input type="hidden" name="ml-submit" value="1" />

                <div className="ml-form-embedSubmit">
                  <button type="submit" className="primary">
                    Submit Request
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
                <h4>Message Sent</h4>
                <p>Thanks -- we'll be in touch shortly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
