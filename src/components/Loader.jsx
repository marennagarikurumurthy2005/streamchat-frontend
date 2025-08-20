import React from "react";
import { ThreeDot } from "react-loading-indicators";
const Loader = () => {
  return (
    <div className="w-full h-screen bg-[#F4F2EE] realtive flex items-center justify-center">
      <div className="absolute top-80 left-1/2 -translate-x-1/2">
        <ThreeDot variant="bounce" color="#32cd32" size="medium" />
      </div>
      <div>
        <h1>Loading</h1>
      </div>
    </div>
  );
};

export default Loader;