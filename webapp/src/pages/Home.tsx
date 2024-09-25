import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrizeDiamond } from "../hooks/usePrizeDiamond";
import { useAppContext } from "../contexts/AppContext";
import PrizeCard from "../components/PrizeCard";
import { UserRoles } from "../lib/types";
import { PrizeDetails } from "../lib/types";

const PRIZES_PER_PAGE = 9;

const isUserActiveInPrize = (userRoles: UserRoles) => {
  return userRoles.includes("ADMIN_ROLE") || userRoles.includes("EVALUATOR_ROLE");
};

const Home: React.FC = () => {
  const { userRoles } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrizes, setTotalPrizes] = useState(0);

  // Ensure hooks are called at the top level of the component
  const prizeDiamond = usePrizeDiamond();

  const { data, isLoading, error } = useQuery<PrizeDetails[], Error>({
    queryKey: ["prizes", currentPage],
    queryFn: () => {
      const startIndex = BigInt((currentPage - 1) * PRIZES_PER_PAGE);
      const count = BigInt(PRIZES_PER_PAGE);
      return prizeDiamond.getPrizes(startIndex, count);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    const fetchTotalPrizes = async () => {
      try {
        const count = await prizeDiamond.getPrizeCount();
        setTotalPrizes(Number(count));
      } catch (error) {
        console.error("Error fetching total prize count:", error);
      }
    };
    fetchTotalPrizes();
  }, [prizeDiamond.getPrizeCount]);

  const totalPages = Math.max(1, Math.ceil(totalPrizes / PRIZES_PER_PAGE));

  const sortedPrizes = useMemo(() => {
    const prizes = data ?? [];
    const activePrizes = prizes.filter((_) => isUserActiveInPrize(userRoles));
    const inactivePrizes = prizes.filter((_) => !isUserActiveInPrize(userRoles));
    return [...activePrizes, ...inactivePrizes];
  }, [data, userRoles]);

  if (error) {
    console.error("Error fetching prizes:", error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-default">
      <div className="gradient-background rounded-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 text-white shadow-lg">
        <p className="text-sm-mobile mb-4 sm:mb-6">
          A decentralized platform revolutionizing prize management with homomorphic smart contracts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard title="Privacy & Transparency" description="Ensure data privacy while maintaining verifiable records." />
          <FeatureCard title="Flexible Rewards" description="Support both monetary and non-monetary incentives." />
          <FeatureCard title="Community-Driven" description="Involve stakeholders in prize creation and evaluation." />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center">Loading prizes...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error loading prizes. Please try again later.</p>
      ) : (
        <div id="prizes" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedPrizes.length === 0 ? (
            <p className="text-gray-500 col-span-full">
              No prizes available at the moment. (Total count: {totalPrizes})
            </p>
          ) : (
            sortedPrizes.map((prize) => <PrizeCard key={prize.id} prize={prize} />)
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="card bg-opacity-50 p-3 sm:p-4">
    <h3 className="text-base-mobile font-semibold mb-2">{title}</h3>
    <p className="text-xs-mobile">{description}</p>
  </div>
);

export default Home;
