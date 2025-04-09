"use client";

import React, { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6477167181117418"
      data-ad-slot="2511089592"
      data-ad-format="auto"
      data-full-width-responsive={true.toString()}
    ></ins>
  );
};

export default AdBanner;
