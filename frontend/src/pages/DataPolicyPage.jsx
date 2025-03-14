import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faArrowLeft, faLock, faExchangeAlt, faEye, faClock } from '@fortawesome/free-solid-svg-icons';

const DataPolicyPage = () => {
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
          <FontAwesomeIcon icon={faDatabase} className="text-blue-600 text-4xl mb-4" />
          <h1 className="text-3xl font-bold">Data Policy</h1>
          <p className="text-gray-500 mt-2">Last Updated: March 14, 2025</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Data Policy explains our practices regarding the collection, use, and processing of your personal data. It complements our Privacy Policy by providing more detailed information about how we handle your data.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0 text-blue-500">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  We take your data protection seriously. Our platform is designed with privacy and security as core principles.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">2. Categories of Data We Process</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Examples</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Account Data</td>
                  <td className="border border-gray-300 px-4 py-2">Email, username, password (encrypted)</td>
                  <td className="border border-gray-300 px-4 py-2">Account management, authentication</td>
                  <td className="border border-gray-300 px-4 py-2">Contract performance</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Profile Data</td>
                  <td className="border border-gray-300 px-4 py-2">Name, bio, profile picture</td>
                  <td className="border border-gray-300 px-4 py-2">Personalization, community features</td>
                  <td className="border border-gray-300 px-4 py-2">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Activity Data</td>
                  <td className="border border-gray-300 px-4 py-2">Ratings, watchlists, search history</td>
                  <td className="border border-gray-300 px-4 py-2">Feature functionality, recommendations</td>
                  <td className="border border-gray-300 px-4 py-2">Contract performance</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Technical Data</td>
                  <td className="border border-gray-300 px-4 py-2">IP address, device info, browser type</td>
                  <td className="border border-gray-300 px-4 py-2">Security, service optimization</td>
                  <td className="border border-gray-300 px-4 py-2">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Communication Data</td>
                  <td className="border border-gray-300 px-4 py-2">Support requests, feedback</td>
                  <td className="border border-gray-300 px-4 py-2">Customer support, service improvement</td>
                  <td className="border border-gray-300 px-4 py-2">Legitimate interest</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">3. Data Storage and Security</h2>
          
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mt-1 bg-blue-100 rounded-full p-2 text-blue-600">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Data Security Measures</h3>
              <p className="text-gray-700 mt-1">
                We implement robust security measures to protect your data, including:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li>Encryption of sensitive data both in transit and at rest</li>
                <li>Regular security audits and vulnerability testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Server security monitoring and intrusion detection</li>
                <li>Employee training on data protection and security practices</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mt-1 bg-blue-100 rounded-full p-2 text-blue-600">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Data Retention</h3>
              <p className="text-gray-700 mt-1">
                We retain different categories of data for different periods:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li><strong>Account Data:</strong> Retained for the duration of your account plus 30 days after deletion</li>
                <li><strong>Activity Data:</strong> Retained for the duration of your account</li>
                <li><strong>Technical Data:</strong> Retained for up to 12 months</li>
                <li><strong>Communication Data:</strong> Retained for 2 years after the last interaction</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">4. Data Sharing and Third Parties</h2>
          
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mt-1 bg-blue-100 rounded-full p-2 text-blue-600">
              <FontAwesomeIcon icon={faExchangeAlt} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Third-Party Service Providers</h3>
              <p className="text-gray-700 mt-1">
                We share data with the following categories of service providers:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li><strong>Hosting Providers:</strong> For storing our database and serving our web application</li>
                <li><strong>Analytics Providers:</strong> To understand usage patterns and improve our service</li>
                <li><strong>Payment Processors:</strong> To process subscription payments (if applicable)</li>
                <li><strong>Email Service Providers:</strong> To send notifications and marketing communications</li>
                <li><strong>Customer Support Tools:</strong> To manage and respond to support requests</li>
              </ul>
              <p className="text-gray-700 mt-2">
                All third-party service providers are contractually obligated to use your data only for the specific purposes and in accordance with our instructions.
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">5. Data Subject Rights</h2>
          
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mt-1 bg-blue-100 rounded-full p-2 text-blue-600">
              <FontAwesomeIcon icon={faEye} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Your Data Rights</h3>
              <p className="text-gray-700 mt-1">
                Depending on your location, you may have the following rights regarding your data:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> You can request deletion of your data under certain conditions</li>
                <li><strong>Right to Restriction:</strong> You can request limited processing of your data</li>
                <li><strong>Right to Data Portability:</strong> You can request your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> You can object to certain types of processing</li>
              </ul>
              <p className="text-gray-700 mt-2">
                To exercise these rights, please contact us at privacy@moviedb.example.com.
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist in our marketing efforts. For more detailed information about our use of these technologies, please see our <Link to="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">7. International Data Transfers</h2>
          <p className="mb-4">
            Our services are operated in the United States. If you are located outside of the United States, please be aware that your information will be transferred to, stored, and processed in the United States. We take appropriate safeguards to ensure that your data is treated securely and in accordance with this Data Policy regardless of location.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">8. Changes to this Data Policy</h2>
          <p className="mb-4">
            We may update this Data Policy from time to time in response to changing legal, technical, or business developments. When we update our Data Policy, we will take appropriate measures to inform you, consistent with the significance of the changes we make.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">9. Data Protection Contact</h2>
          <p className="mb-4">
            If you have any questions about this Data Policy or our data practices, please contact our Data Protection Officer:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>Email: dpo@moviedb.example.com</p>
            <p>Address: 123 Movie Street, Hollywood, CA 90210</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            By using our services, you acknowledge that you have read and understood this Data Policy.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <span className="text-gray-400">|</span>
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <span className="text-gray-400">|</span>
            <Link to="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="mt-8 text-xs text-center text-gray-500">
          <p>User: shreyauprety | Last viewed: 2025-03-14 13:59:29 UTC</p>
        </div>
      </div>
    </div>
  );
};

export default DataPolicyPage;