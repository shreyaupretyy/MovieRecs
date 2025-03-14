import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookie, faArrowLeft, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const CookiePolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:underline mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <FontAwesomeIcon icon={faCookie} className="text-blue-600 text-4xl mb-4" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
          <p className="text-gray-500 mt-2">Last Updated: March 14, 2025</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Cookie Policy explains how we use cookies and similar tracking technologies on our movie database platform. By using our website, you consent to the use of cookies as described in this policy.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0 text-blue-500">
                <FontAwesomeIcon icon={faInfoCircle} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You can manage your cookie preferences at any time by adjusting your browser settings or using our cookie preference center accessible from the footer of our website.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">2. What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit websites. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how users interact with their sites.
          </p>
          <p className="mb-4">
            Cookies are not harmful and cannot introduce viruses or extract personal information from your device. They can only store data that you have shared with a website or that is needed for improving your experience.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">3. Types of Cookies We Use</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3.1 Essential Cookies</h3>
            <p className="mb-2">
              These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure areas access, and account management. The website cannot function properly without these cookies.
            </p>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-medium">Examples:</p>
              <ul className="list-disc ml-5 text-sm">
                <li>Session cookies for maintaining user state</li>
                <li>Authentication cookies for logged-in users</li>
                <li>Security cookies for fraud prevention</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3.2 Functionality Cookies</h3>
            <p className="mb-2">
              These cookies allow the website to remember choices you make and provide enhanced, more personal features. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-medium">Examples:</p>
              <ul className="list-disc ml-5 text-sm">
                <li>Language preference cookies</li>
                <li>Theme/display setting cookies</li>
                <li>Watchlist and rating storage cookies</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3.3 Performance & Analytics Cookies</h3>
            <p className="mb-2">
              These cookies collect information about how visitors use a website, such as which pages they visit most often and if they get error messages. They help us understand and improve our website's performance.
            </p>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-medium">Examples:</p>
              <ul className="list-disc ml-5 text-sm">
                <li>Google Analytics cookies</li>
                <li>Performance monitoring cookies</li>
                <li>Load balancing session cookies</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3.4 Targeting & Advertising Cookies</h3>
            <p className="mb-2">
              These cookies are used to track browsing habits and activity to deliver targeted advertising. They are used to limit the number of times you see an ad and help measure the effectiveness of advertising campaigns.
            </p>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-medium">Examples:</p>
              <ul className="list-disc ml-5 text-sm">
                <li>Third-party advertising cookies</li>
                <li>Social media cookies for sharing and engagement</li>
                <li>Retargeting cookies</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">4. Specific Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Provider</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Expiry</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">session_id</td>
                  <td className="border border-gray-300 px-4 py-2">Our website</td>
                  <td className="border border-gray-300 px-4 py-2">Authentication</td>
                  <td className="border border-gray-300 px-4 py-2">Session</td>
                  <td className="border border-gray-300 px-4 py-2">Essential</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">user_pref_lang</td>
                  <td className="border border-gray-300 px-4 py-2">Our website</td>
                  <td className="border border-gray-300 px-4 py-2">Language preference</td>
                  <td className="border border-gray-300 px-4 py-2">1 year</td>
                  <td className="border border-gray-300 px-4 py-2">Functionality</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">_ga</td>
                  <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                  <td className="border border-gray-300 px-4 py-2">Visitor statistics</td>
                  <td className="border border-gray-300 px-4 py-2">2 years</td>
                  <td className="border border-gray-300 px-4 py-2">Analytics</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">_fbp</td>
                  <td className="border border-gray-300 px-4 py-2">Facebook</td>
                  <td className="border border-gray-300 px-4 py-2">Marketing</td>
                  <td className="border border-gray-300 px-4 py-2">3 months</td>
                  <td className="border border-gray-300 px-4 py-2">Advertising</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">watchlist_items</td>
                  <td className="border border-gray-300 px-4 py-2">Our website</td>
                  <td className="border border-gray-300 px-4 py-2">Watchlist storage</td>
                  <td className="border border-gray-300 px-4 py-2">1 year</td>
                  <td className="border border-gray-300 px-4 py-2">Functionality</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">5. Managing Your Cookie Preferences</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">5.1 Browser Settings</h3>
            <p className="mb-2">
              Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The following links provide information on how to modify cookie settings in the most popular browsers:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0 text-yellow-500">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please note that if you choose to block certain cookies, you may not be able to use all the features of our website.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">5.2 Our Cookie Preference Center</h3>
            <p className="mb-2">
              You can also manage your cookie preferences using our Cookie Preference Center, which can be accessed from the footer of our website. This allows you to selectively opt-in or opt-out of non-essential cookies.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2">
              Open Cookie Preferences
            </button>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">6. Third-Party Cookies</h2>
          <p className="mb-4">
            Some of our pages display content from external providers, such as YouTube, Facebook, and Twitter. To view this third-party content, you first have to accept their specific terms and conditions. This also includes their cookie policies, which we have no control over.
          </p>
          <p className="mb-4">
            If you do not view this content, no third-party cookies are installed on your device.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">7. Changes to this Cookie Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated revision date. If we make significant changes to this policy, we will provide a more prominent notice.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>Email: privacy@moviedb.example.com</p>
            <p>Address: 123 Movie Street, Hollywood, CA 90210</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            By continuing to use our website, you consent to the use of cookies as described in this policy.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <span className="text-gray-400">|</span>
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <span className="text-gray-400">|</span>
            <Link to="/data-policy" className="text-blue-600 hover:underline">Data Policy</Link>
          </div>
        </div>
        
        {/* Debug Info */}
      </div>
    </div>
  );
};

export default CookiePolicyPage;