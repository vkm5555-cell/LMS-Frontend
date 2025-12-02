const FrontFooter = () => {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-800">
          
          {/* Technical Skills */}
          <div>
            <h3 className="text-base font-semibold mb-4">Technical Skills</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">ChatGPT</a></li>
              <li><a href="#" className="hover:underline">Coding</a></li>
              <li><a href="#" className="hover:underline">Computer Science</a></li>
              <li><a href="#" className="hover:underline">Cybersecurity</a></li>
              <li><a href="#" className="hover:underline">DevOps</a></li>
              <li><a href="#" className="hover:underline">Ethical Hacking</a></li>
              <li><a href="#" className="hover:underline">Generative AI</a></li>
              <li><a href="#" className="hover:underline">Java Programming</a></li>
              <li><a href="#" className="hover:underline">Python</a></li>
              <li><a href="#" className="hover:underline">Web Development</a></li>
            </ul>
          </div>

          {/* Analytical Skills */}
          <div>
            <h3 className="text-base font-semibold mb-4">Analytical Skills</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Artificial Intelligence</a></li>
              <li><a href="#" className="hover:underline">Big Data</a></li>
              <li><a href="#" className="hover:underline">Business Analysis</a></li>
              <li><a href="#" className="hover:underline">Data Analytics</a></li>
              <li><a href="#" className="hover:underline">Data Science</a></li>
              <li><a href="#" className="hover:underline">Financial Modeling</a></li>
              <li><a href="#" className="hover:underline">Machine Learning</a></li>
              <li><a href="#" className="hover:underline">Microsoft Excel</a></li>
              <li><a href="#" className="hover:underline">Microsoft Power BI</a></li>
              <li><a href="#" className="hover:underline">SQL</a></li>
            </ul>
          </div>

          {/* Business Skills */}
          <div>
            <h3 className="text-base font-semibold mb-4">Business Skills</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Accounting</a></li>
              <li><a href="#" className="hover:underline">Digital Marketing</a></li>
              <li><a href="#" className="hover:underline">E-commerce</a></li>
              <li><a href="#" className="hover:underline">Finance</a></li>
              <li><a href="#" className="hover:underline">Google</a></li>
              <li><a href="#" className="hover:underline">Graphic Design</a></li>
              <li><a href="#" className="hover:underline">Marketing</a></li>
              <li><a href="#" className="hover:underline">Project Management</a></li>
              <li><a href="#" className="hover:underline">Social Media Marketing</a></li>
            </ul>
          </div>

          {/* Career Resources */}
          <div>
            <h3 className="text-base font-semibold mb-4">Career Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Essential IT Certifications</a></li>
              <li><a href="#" className="hover:underline">High-Income Skills to Learn</a></li>
              <li><a href="#" className="hover:underline">How to Get a PMP Certification</a></li>
              <li><a href="#" className="hover:underline">How to Learn Artificial Intelligence</a></li>
              <li><a href="#" className="hover:underline">Popular Cybersecurity Certifications</a></li>
              <li><a href="#" className="hover:underline">Popular Data Analytics Certifications</a></li>
              <li><a href="#" className="hover:underline">What Does a Data Analyst Do?</a></li>
              <li><a href="#" className="hover:underline">Career Development Resources</a></li>
              <li><a href="#" className="hover:underline">Career Aptitude Test</a></li>
              <li><a href="#" className="hover:underline">Share your Coursera Learning Story</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} <span className="font-bold">BBD ED TECH</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FrontFooter;
