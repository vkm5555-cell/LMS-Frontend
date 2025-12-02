import Navbar from "../../components/common/frontend/Navbar";  
import PageMeta from "../../components/common/PageMeta";
import CourseView from "../../components/frontend/Courses/CourseView";
import PopularCertificates from "../../components/frontend/home/PopularCertificates"; 
import GenAISection from "../../components/frontend/home/GenAISection"; 
import NewOnBBDU from "../../components/frontend/home/NewOnBBDU"; 
import DegreePrograms from "../../components/frontend/home/DegreePrograms";
import TrendingNow from "../../components/frontend/home/TrendingNow"; 
import FitInLifeSection from "../../components/frontend/home/FitInLifeSection";
import FrontFooter from "../../components/common/frontend/FrontFooter";

export default function Home() {
  return ( 
    <>
      <PageMeta
        title="BBD ED TECH LMS | Courses View"
        description="Best Private University in Lucknow – BBDU. Offering career-focused UG &amp; PG programs, world-class campus, and vibrant student life. Admissions Open – Apply Now!"
      />

      {/* Navbar */}
      <Navbar />

             
      {/* Partners Section */}
      <CourseView />

      {/* PopularCertificates sections */}      
      <PopularCertificates />

      {/* GenAISection sections */}      
      <GenAISection />

      {/* GenAISection sections */}      
      <NewOnBBDU />

      {/* GenAISection sections */}      
      <DegreePrograms />

      {/* GenAISection sections */}      
      <TrendingNow />

      {/* GenAISection sections */}      
      <FitInLifeSection />
      {/* More sections */} 

      {/* Navbar */}
      <FrontFooter />
  

    </>
  );
}
