import { motion } from 'framer-motion';
import HeroSection from '../components/main/HeroSection';
import AdvertisementSection from '../components/homepage/AdvertisementSection';
import CategoriesSection from '../components/main/CategoriesSection';
import TopRunningCourses from '../components/main/TopRunningCourses';
import FeaturedCourses from '../components/main/FeaturedCourses';
import TestimonialsSection from '../components/main/TestimonialsSection';
import AskForHelp from '../components/main/AskForHelp';
import TopCompanies from '../components/main/TopCompanies';

function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <HeroSection />
            
            {/* Advertisement Section */}
            <AdvertisementSection />
            
            {/* Categories & Subcategories Section */}
            <CategoriesSection />
            
            {/* Best 10 Running Courses Section */}
            <TopRunningCourses />
            
            {/* Featured Courses Section */}
            <FeaturedCourses />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Ask For Help Section */}
            <AskForHelp />

            {/* Top Companies Section */}
            {/* <TopCompanies /> */}
        </div>

    );
}

export default Home;
