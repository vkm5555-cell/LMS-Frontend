import Navbar from "../../components/common/frontend/Navbar";  
import PageMeta from "../../components/common/PageMeta";
import Banner from "../../components/frontend/home/Banner";
import Partners from "../../components/frontend/home/Partners";
import HomeRoleTabs from "../../components/frontend/home/HomeRoleTabs"; 
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
        title="BBD ED LMS | BBDU University in Lucknow"
        description="Best Private University in Lucknow – BBDU. Offering career-focused UG &amp; PG programs, world-class campus, and vibrant student life. Admissions Open – Apply Now!"
      />

      {/* Navbar */}
      <Navbar />

      {/* Banner Section */}
      <Banner />

      {/* Partners Section */}
      <Partners />  
       
       {/* Partners Section */}
      <HomeRoleTabs />

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
