//import React from "react";
import { Link } from "react-router"; 

const partners = [
  { name: "BBDU", img: "/images/logo/bbdu-logo.gif" },

];

const Partners = () => {
  return (
    <section className="bg-[#f8fbff] py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          We collaborate with{" "}
          <Link
            to="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            350+ leading universities and companies
          </Link>
        </h2>

        {/* Logos Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 items-center justify-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center"
            >
              <img
                src={partner.img}
                alt={partner.name}
                className="max-h-10 sm:max-h-12 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
