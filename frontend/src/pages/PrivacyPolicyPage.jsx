import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const PrivacyPolicyPage = () => {
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
          <FontAwesomeIcon icon={faShield} className="text-blue-600 text-4xl mb-4" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-gray-500 mt-2">Last Updated: March 14, 2025</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Privacy Policy explains how we collect, use, store, and share your information when you use our movie database platform. We are committed to protecting your privacy and handling your data with transparency and care.
          </p>
          <p className="mb-4">
            By using our service, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please discontinue use of our services.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold mb-2">2.1 Information You Provide</h3>
          <p className="mb-4">
          We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Account information (username, email address, password)</li>
            <li>Profile information (name, bio, profile picture)</li>
            <li>User-generated content (ratings, reviews, watchlists)</li>
            <li>Communications with us (support requests, survey responses)</li>
            <li>Payment information, if applicable (processed by secure third-party payment processors)</li>
          </ul>
          
          <h3 className="text-lg font-semibold mb-2">2.2 Information We Collect Automatically</h3>
          <p className="mb-4">
            When you use our service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Usage data (movies viewed, searches performed, features used)</li>
            <li>Device information (IP address, device type, operating system, browser type)</li>
            <li>Log data (access times, pages viewed, referring websites)</li>
            <li>Location information (general location based on IP address)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Providing, maintaining, and improving our services</li>
            <li>Creating and maintaining your account</li>
            <li>Processing transactions</li>
            <li>Sending notifications, updates, and marketing communications</li>
            <li>Personalizing your experience (recommendations, content)</li>
            <li>Responding to your comments, questions, and requests</li>
            <li>Monitoring and analyzing usage patterns and trends</li>
            <li>Protecting our services and users from fraudulent or harmful activities</li>
            <li>Complying with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">4. Information Sharing and Disclosure</h2>
          <p className="mb-4">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li><strong>With your consent:</strong> We share information when you explicitly permit us to do so.</li>
            <li><strong>Service providers:</strong> We share information with vendors, consultants, and other service providers who need access to such information to perform work on our behalf.</li>
            <li><strong>Legal requirements:</strong> We may share information if we believe it's necessary to comply with a legal obligation, protect our rights, or the safety of users.</li>
            <li><strong>Business transfers:</strong> If we're involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.</li>
            <li><strong>Aggregate or de-identified information:</strong> We may share information that has been aggregated or de-identified so that it can no longer be used to identify you.</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">5. Your Rights and Choices</h2>
          <p className="mb-4">
            You have several rights regarding your personal information:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li><strong>Account Information:</strong> You can update your account information at any time by logging into your account and accessing your profile settings.</li>
            <li><strong>Marketing Communications:</strong> You can opt out of receiving promotional emails by following the instructions in those emails or by adjusting your notification settings.</li>
            <li><strong>Cookies:</strong> Most web browsers accept cookies by default. You can configure your browser to reject cookies or notify you when a cookie is set.</li>
            <li><strong>Data Access and Portability:</strong> You can request a copy of your personal information that we hold.</li>
            <li><strong>Deletion:</strong> You can request that we delete your account and associated information, subject to certain exceptions.</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as your account is active or as needed to provide you services. We may also retain certain information as required by law or for legitimate business purposes.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
          <p className="mb-4">
            Our services are not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">8. Security</h2>
          <p className="mb-4">
            We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet or email transmission is ever fully secure, so we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">9. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have different data protection laws than your country.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">10. Changes to this Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. You are advised to review this policy periodically for any changes.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>Email: privacy@moviedb.example.com</p>
            <p>Address: 123 Movie Street, Hollywood, CA 90210</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            By using our services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <span className="text-gray-400">|</span>
            <Link to="/data-policy" className="text-blue-600 hover:underline">Data Policy</Link>
            <span className="text-gray-400">|</span>
            <Link to="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
          </div>
        </div>
        
        {/* Debug Info */}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;