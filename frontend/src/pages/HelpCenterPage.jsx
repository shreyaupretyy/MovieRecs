import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faBook, 
  faLifeRing,
  faFilm,
  faStar,
  faBookmark,
  faUser,
  faSearch,
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const HelpCenterPage = () => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [expandedFaqs, setExpandedFaqs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Toggle FAQ expansion
    const toggleFaq = (id) => {
      if (expandedFaqs.includes(id)) {
        setExpandedFaqs(expandedFaqs.filter(faqId => faqId !== id));
      } else {
        setExpandedFaqs([...expandedFaqs, id]);
      }
    };
    
    // Check if a FAQ is expanded
    const isExpanded = (id) => {
      return expandedFaqs.includes(id);
    };
    
    // Filter FAQs based on search query
    const filterFaqs = (faqs) => {
      if (!searchQuery) return faqs;
      
      return faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };
    
    // FAQ categories
    const faqCategories = {
      general: {
        title: 'General Questions',
        icon: faQuestionCircle,
        faqs: [
          {
            id: 'general-1',
            question: 'What is this website?',
            answer: 'This is a movie database platform where you can discover, rate, and keep track of movies you want to watch. You can create a watchlist, rate movies, and get personalized recommendations based on your preferences.'
          },
          {
            id: 'general-2',
            question: 'Do I need to create an account?',
            answer: 'You can browse movies without an account, but you\'ll need to create an account to save movies to your watchlist, rate movies, and get personalized recommendations. Creating an account is free and only takes a minute!'
          },
          {
            id: 'general-3',
            question: 'Is this service free to use?',
            answer: 'Yes, our basic service is completely free to use. We may introduce premium features in the future, but the core functionality will always remain free.'
          },
          {
            id: 'general-4',
            question: 'Where does the movie data come from?',
            answer: 'Our movie data comes from OMDB (Open Movie Database). We regularly update our database to ensure accuracy and completeness.'
          }
        ]
      },
      watchlist: {
        title: 'Watchlist',
        icon: faBookmark,
        faqs: [
          {
            id: 'watchlist-1',
            question: 'How do I add a movie to my watchlist?',
            answer: 'To add a movie to your watchlist, navigate to the movie\'s page and click the "Add to Watchlist" button. You can also add movies from search results or recommendation pages by clicking the bookmark icon on the movie card.'
          },
          {
            id: 'watchlist-2',
            question: 'How do I remove a movie from my watchlist?',
            answer: 'To remove a movie from your watchlist, you can go to the movie\'s page and click "Remove from Watchlist", or go to your watchlist page and click the remove button on the movie card you wish to remove.'
          },
          {
            id: 'watchlist-3',
            question: 'Can I add notes to movies in my watchlist?',
            answer: 'Yes! When viewing your watchlist, you can add personal notes to any movie by clicking the "Notes" button. These notes are private and only visible to you.'
          },
          {
            id: 'watchlist-4',
            question: 'Is there a limit to how many movies I can add to my watchlist?',
            answer: 'There\'s no limit to how many movies you can add to your watchlist. However, for better organization, you might want to keep it to a manageable size.'
          }
        ]
      },
      ratings: {
        title: 'Ratings & Reviews',
        icon: faStar,
        faqs: [
          {
            id: 'ratings-1',
            question: 'How do I rate a movie?',
            answer: 'To rate a movie, navigate to the movie\'s page and click on the star rating widget. You can select from 1 to 5 stars. You can also rate movies directly from your watchlist or from movie cards that include the rating feature.'
          },
          {
            id: 'ratings-2',
            question: 'Can I change my rating?',
            answer: 'Yes, you can change your rating at any time by visiting the movie\'s page and selecting a new star rating, or by updating it from any page where your rating is displayed.'
          },
          {
            id: 'ratings-3',
            question: 'How do I write a review?',
            answer: 'After rating a movie, you can add a written review by clicking "Add a review" button that appears below your rating. You can edit or delete your reviews at any time.'
          },
          {
            id: 'ratings-4',
            question: 'Are my ratings public?',
            answer: 'By default, your ratings are visible to other users. You can change this in your privacy settings if you prefer to keep your ratings private.'
          }
        ]
      },
      account: {
        title: 'Account & Settings',
        icon: faUser,
        faqs: [
          {
            id: 'account-1',
            question: 'How do I create an account?',
            answer: 'Click the "Sign Up" button in the top-right corner of the page. You\'ll need to provide a username, email address, and password. You can also sign up using your Google or Facebook account for faster registration.'
          },
          {
            id: 'account-2',
            question: 'How do I change my password?',
            answer: 'Go to the Settings page, select the "Password" tab, and follow the instructions to change your password. You\'ll need to enter your current password for security reasons.'
          },
          {
            id: 'account-3',
            question: 'How do I delete my account?',
            answer: 'Go to the Settings page, scroll to the bottom, and click "Delete Account". You\'ll be asked to confirm this action by entering your password. Note that account deletion is permanent and cannot be undone.'
          },
          {
            id: 'account-4',
            question: 'How do I customize my notification preferences?',
            answer: 'Go to the Settings page and select the "Notifications" tab. There you can customize which notifications you receive and how you receive them.'
          }
        ]
      }
    };
    
    // Get the active FAQs
    const activeFaqs = faqCategories[activeCategory]?.faqs || [];
    const filteredFaqs = filterFaqs(activeFaqs);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="mt-2 text-gray-600">
            Find answers to common questions about using our platform
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold mb-4 text-gray-800">Help Topics</h2>
              
              <nav>
                {Object.keys(faqCategories).map(category => (
                  <button 
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setSearchQuery(''); // Clear search when changing categories
                    }}
                    className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center ${
                      activeCategory === category 
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={faqCategories[category].icon} 
                      className="mr-2" 
                    />
                    {faqCategories[category].title}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-700">Still need help?</h3>
                <Link 
                  to="/contact" 
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <FontAwesomeIcon icon={faLifeRing} className="mr-2" />
                  Contact Support
                </Link>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Documentation</h3>
              <p className="text-sm text-blue-700 mb-3">
                Check our detailed user guides for step-by-step instructions.
              </p>
              <Link 
                to="/documentation" 
                className="text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center"
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                View Documentation
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FontAwesomeIcon 
                  icon={faqCategories[activeCategory].icon} 
                  className="text-blue-600 mr-3" 
                />
                {faqCategories[activeCategory].title}
              </h2>
              
              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No results found for "{searchQuery}"
                  </p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map(faq => (
                    <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100"
                      >
                        <span className="font-medium">{faq.question}</span>
                        <FontAwesomeIcon 
                          icon={isExpanded(faq.id) ? faChevronDown : faChevronRight} 
                          className="text-gray-500"
                        />
                      </button>
                      
                      {isExpanded(faq.id) && (
                        <div className="p-4 bg-white">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Help footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Didn't find what you were looking for?
                </p>
                <div className="mt-2 flex justify-center space-x-4">
                  <Link 
                    to="/contact" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FontAwesomeIcon icon={faLifeRing} className="mr-1" />
                    Contact Support
                  </Link>
                  <Link 
                    to="/community" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    Community Forum
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Debug Info */}
          </div>
        </div>
      </div>
    );
  };
  
  export default HelpCenterPage;