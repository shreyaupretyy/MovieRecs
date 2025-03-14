import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const TermsOfServicePage = () => {
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
          <FontAwesomeIcon icon={faGavel} className="text-blue-600 text-4xl mb-4" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-gray-500 mt-2">Last Updated: March 14, 2025</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using our movie database platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Our platform provides users with information about movies, the ability to create watchlists, rate movies, and receive personalized recommendations. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">3. User Accounts</h2>
          <h3 className="text-lg font-semibold mb-2">3.1 Registration</h3>
          <p className="mb-4">
            To access certain features of our service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">3.2 Account Security</h3>
          <p className="mb-4">
            You are responsible for safeguarding your password and for any activities or actions under your account. We encourage you to use strong passwords and to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">4. User Content</h2>
          <h3 className="text-lg font-semibold mb-2">4.1 Content Responsibility</h3>
          <p className="mb-4">
            By submitting content (ratings, reviews, comments, etc.) to our platform, you represent that you own or have the necessary rights to such content and that it does not violate any third-party rights.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">4.2 License Grant</h3>
          <p className="mb-4">
            By submitting content to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and display such content in connection with the service.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">4.3 Content Guidelines</h3>
          <p className="mb-4">
            You agree not to post content that is illegal, offensive, abusive, defamatory, or otherwise objectionable. We reserve the right to remove any content that violates these guidelines or our policies.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">5. Prohibited Conduct</h2>
          <p className="mb-4">
            You agree not to:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Use the service for any illegal purpose or in violation of any laws</li>
            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Use any robot, spider, or other automated device to access the service</li>
            <li>Collect or harvest any information about other users</li>
            <li>Upload viruses or other malicious code</li>
            <li>Violate any third-party rights, including intellectual property rights</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            The service and its original content (excluding user-submitted content) are protected by copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used without our prior written permission.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">7. Third-Party Links</h2>
          <p className="mb-4">
            Our service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">8. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including but not limited to a breach of the Terms.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">9. Disclaimer of Warranties</h2>
          <p className="mb-4">
            The service is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the service, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the service after any changes constitute your acceptance of the new Terms.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">12. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">13. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>Email: terms@moviedb.example.com</p>
            <p>Address: 123 Movie Street, Hollywood, CA 90210</p>
          </div>
          </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            By using our services, you acknowledge that you have read and understood these Terms of Service.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
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

export default TermsOfServicePage;