import { Link } from "react-router";


const Banner = () => {
  return (
    <section className="bg-blue-600 text-white py-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-10">
        {/* Left Content */}
        <div className="max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Discover new skills and big savings
          </h2>
          <p className="mb-6 text-lg">
            Get BBD ED TECH  and unlock
            unlimited access to 10,000+ skill-building courses from Google, IBM,
            Microsoft, and more.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/plans/plus"
              className="bg-white text-blue-600 font-semibold px-5 py-2 rounded-md shadow hover:bg-gray-100"
            >
              Save on BBD ED TECH Plus
            </Link>
            <Link
              to="/plans/teams"
              className="border border-white px-5 py-2 rounded-md hover:bg-white hover:text-blue-600 transition"
            >
              Save on Teams
            </Link>
          </div>
        </div>

        {/* Right Content - Banner Image */}
        <div className="relative">
          {/* <img
            src="/banner/banner1.png"
            alt="BBD ED TECH Plus Offer"
            className="rounded-xl shadow-lg w-full max-w-md"
          /> */}
        </div>
      </div>
    </section>
  );
};

export default Banner;
